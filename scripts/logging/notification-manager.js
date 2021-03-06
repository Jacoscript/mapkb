// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for notification functions and stylization.

// ########################### //
// ### Notification System ### //
// ########################### //
'use strict';
class ManagerNotification {
	constructor() {
		this.loop_time = 2;  // time in hours how long the loop should continue
		this.loop_notification_index = 1;
		this.notification_queue = [];
		this.notification_speed = 600;
		this.notification_toggle = false; // False = turned off
	}

	addToNotificationQueue(type, content) {
		// A function that takes in the notification type and the content message
		// of the notification and then adds the given content to a list of
		// notifications waiting to be displayed.
	
		if (type == 'Error' || type == 'Other' ||type == 'Success' || type == 'Warning') {
			this.notification_queue.push([type, content]);
			// Add to 'In Queue' dropdown item in the notifications tab
			$('#notification-in-queue').html('In Queue (' + this.notification_queue.length + ')');
		} else {
			this.showNotification('Error', 'Notification "' + type + '" was not of type "Error", "Other", "Success" or "Warning".');
		}
	}

	loopNotificationQueue() {
		// A function that continuously checks, every 10 seconds, the notification
		// queue so it knows when to show notifications or not.
	
		var that = this;
		setTimeout(function() {
			if (that.notification_queue.length > 0 && that.notification_toggle == false) {
				that.loop_notification_index++;
				var notif_type = that.notification_queue[0][0];
				var notif_content = that.notification_queue[0][1];
				that.showNotification(notif_type, notif_content);
				if (that.loop_notification_index < (that.loop_time * 3600)) {
					that.loopNotificationQueue();
				}
			} else {
				that.loop_notification_index++;
				that.loopNotificationQueue();
			}
		}, 2000);
		//console.log("Notification queue time: (" + this.loop_notification_index + "/" + this.loop_time * 3600 + ")");
	}
	
	modifyNotification(typeOfMessage, messageContent){        
		// A function that allows 4 different types of messages to be displayed.
		// Error, Other, Success, Warning
	
		// Perform checks on message content and change css for the given type of notification
		if (typeOfMessage == 'Error') {
			if (messageContent == null || messageContent == '') {
				messageContent = 'There was an error but no message content was specified.';
			}
		} else if (typeOfMessage == 'Other') {
			if (messageContent == null || messageContent == '') {
				messageContent = 'No message content specified.';
			}
		} else if (typeOfMessage == 'Success') {
			if (messageContent == null || messageContent == '') {
				messageContent = 'It was successful but no message content was specified.';
			}
		} else if (typeOfMessage == 'Warning') {
			if (messageContent == null || messageContent == '') {
				messageContent = 'There may be issues but no message content was specified.';
			}
		}
	
		// Reset notification content to the given content and prepend a title
		if (typeOfMessage == 'Error' || typeOfMessage == 'Other' || typeOfMessage == 'Success' || typeOfMessage == "Warning") {
			typeOfMessage = typeOfMessage.toLowerCase();

			// Format for bootstrap (We changed over to bootstrap after this was made)
			// Note: No need to worry about success or warning as they are already implemented into bootstrap
			if (typeOfMessage == 'error') {
				typeOfMessage = 'danger';
			} else if (typeOfMessage == 'other') {
				typeOfMessage = 'info';
			}
			//$('.notification-bar').html("<h3 class=\"notification-bar-title\">" + typeOfMessage + "</h3>");
			$('.notification-bar').append('<div class="alert alert-' + typeOfMessage + '" alert-dismissible fade show" role="alert">'
										  + messageContent + '<button type="button" class="close" onclick="notification_manager.hideNotification()">'
										  + '	<span aria-hidden="true">&times;</span>'
										  + '</button>'
										  + '</div>');

		}

		// Log notification to database
		// Time zone help: https://www.toptal.com/software/definitive-guide-to-datetime-manipulation
		var date = new Date();
		var day = date.getUTCDate();
		var month = date.getUTCMonth();
		var year = date.getUTCFullYear();
		var hour = date.getUTCHours();  // Local time
		var minutes = date.getUTCMinutes();
		var seconds = date.getUTCSeconds();
		var tz_offset = date.getTimezoneOffset();
		// Convert client time to UTC time
		var sign = tz_offset > 0 ? '-' : '+';

		var tz_offset_hours = this.date_pad(Math.floor(Math.abs(tz_offset) / 60));
		var tz_offset_minutes = this.date_pad(Math.abs(tz_offset) % 60);

		var tz_complete_offset = sign + tz_offset_hours + ':' + tz_offset_minutes + ':00';
		var full_date = this.date_pad((month + 1)) + '/' + this.date_pad(day) 
						+ '/' + year + ' ' + hour + ':' + minutes + ':'
						+ seconds + ' ' + tz_complete_offset;

		// Get current web address
		var current_web_address = 'none'
		try {
			current_web_address = window.location;
		} catch {
			console.log('[Error]: Couldn\'t get current web address for notification log.');
		}
		var data = {
			notif_user_agent: navigator.userAgent,
			notif_time_stamp: full_date,  // Time stamp is UTC (6hrs ahead of Rolla)
			notif_type: typeOfMessage,
			notif_content: messageContent,
			notif_web_address: current_web_address.toString()
		};
		
		// Send information to servlet
		$.ajax({
			type: 'POST',
			url: '/loggingservlet/Servlet',
			data: JSON.stringify(data),
			dataType: 'json',
			success: function(){console.log('Notification logged to the server.');},
			contentType: 'application/json'
		});
	}	
	
	// ############################# //
	// ### Notification Movement ### //
	// ############################# //

	showNotification(type, content) {
		// A function that displays and animates a given notification
	
		$('.notification-bar').css('display', "block");
		this.modifyNotification(type, content);
		if (type == 'Error') {
			console.error("[Notification]: " + type + " - " + content);
		} else if (type == 'Other') {
			console.info("[Notification]: " + type + " - " + content);
		} else if (type == 'Success') {
			console.info("[Notification]: " + type + " - " + content);
		} else if (type == "Warning") {
			console.warn("[Notification]: " + type + " - " + content);
		}
	
		// Slide bar into view after displaying it
		$('.notification-bar').animate({bottom: '0%'}, this.notification_speed);
		this.notification_toggle = true;
	}	
	
	hideNotification() {
		// A function, when called, hides a displayed notification.
	
		// Slide away bar after removing it
		$('.notification-bar').animate({bottom: '-30%'}, this.notification_speed);
		setTimeout(function() {
			$('.notification-bar').css('display', 'none');
		}, this.notification_speed);
	
		// Make sure the queue doesn't try and show another notification while one
		// is still being hidden
		var that = this;
		setTimeout(function() {
			that.notification_toggle = false;
			$('.notification-bar').html('');
		}, this.notification_speed);
	
		// Remove notification after hidden
		this.notification_queue.shift();  // Pop first element
	
		// Update 'In-Queue' dropdown item in notification tab
		$('#notification-in-queue').html('In Queue (' + this.notification_queue.length + ')');
	}

	date_pad(n) {
		// A function that pads the month and day with a '0' when either one
		// has only one digit in their value store.

		return  n < 10 ? '0' + n : n;
	}
}

var notification_manager = new ManagerNotification();

$(document).ready(function() {
	notification_manager.loopNotificationQueue();
	//showNotification('Warning', 'This is only a test.');
});