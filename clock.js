/**
 * WhatTimeIsItThere.info
 *
 * @version 1.0.2
 * @author James Socol <me@jamessocol.com>
 * @idea-by Ben Lew <mail@benlew.com>
 */

function $ ()
{
	if(0==arguments.length){
		return this;
	} else if(1==arguments.length){
		if('string' == typeof arguments[0]) {
			return Extend(document.getElementById(arguments[0]));
		} else {
			return Extend(arguments[0]);
		}
	} else {
		var elements = [];
		for(var i=0;i<arguments.length;i++){
			if('string' == typeof arguments[i]){
				elements.push(Extend(document.getElementById(arguments[i])));
			} else {
				elements.push(Extend(arguments[i]));
			}
		}
		return elements;
	}
}

function Extend(el) {
	if(el.extended) return el;
	el.extended = true;
	el.update = function (frag) {
		if(typeof this.value != 'undefined'){
			this.value = frag;
		}else{
			this.innerHTML = frag;
		}
		return this; 
	};
	el.periodic = function(fn,p,init) {
		setInterval(function(){fn.apply(el)},p);
		if(init){
			fn.apply(el);
		}
		return this;
	}
	el.listen = function(evt,fn) {
		if(el.addEventListener){
			el.addEventListener(evt,fn,false);
		}else if(el.attachEvent){
			el.attachEvent('on'+evt,fn);
		}
		return this;
	}
	return el;
}

Date.prototype.stdTimezoneOffset = function() {
	var jan = new Date(this.getFullYear(), 0, 1);
	var jul = new Date(this.getFullYear(), 6, 1);
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}
Date.prototype.isDST = function() {
	return this.getTimezoneOffset() < this.stdTimezoneOffset();
}
String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/, '');
}

var regexNum  = /^\d+$/;
var regexMin  = /^(m|mi|min|mins|minu|minut|minute|minutes)$/i;
var regexHour = /^(h|ho|hou|hour|hours)$/i;
var regexAnd  = /^(and|&|\+)$/i;
var regexTime = /^(\d+)(?:[:\.](\d+))?(?:(a|p)m?)?$/i;
var regexMer  = /^(a|p)m?$/i;

function adjustDate(){
	var when = $('when').value;
	var parse = when.trim().split(/\s+/);
	var localDate = new Date;
	switch (parse[0].toLowerCase()) {
		case 'in':
			if(regexNum.test(parse[1])){
				var offset = Number(parse[1]);
				if(regexHour.test(parse[2])){
					localDate.setHours(localDate.getHours() + offset);
					if(parse[3]&&parse[3].length>0){
						if(regexNum.test(parse[3])){
							localDate.setMinutes(localDate.getMinutes() + Number(parse[3]));
						} else if(regexAnd.test(parse[3])){
							if(regexNum.test(parse[4])){
								localDate.setMinutes(localDate.getMinutes() + Number(parse[4]));
							}
						}
					}
				} else if(regexMin.test(parse[2])){
					localDate.setMinutes(localDate.getMinutes() + offset);
				}
			}
			break; // end 'in' case
		case 'at':
			if(regexTime.test(parse[1])){
				var time = regexTime.exec(parse[1]);
				time.shift();
				var hour = Number(time[0]);
				var minute = Number(time[1]) || 0;
				var mer = time[2] || (regexMer.test(parse[2]) ? parse[2].toLowerCase() : '');
				if(1==mer.length)mer+='m';
				if(12==hour && 'am'==mer.toLowerCase()){
					hour = 0;
				}else if(hour<12 && 'pm'==mer.toLowerCase()){
					hour += 12;
				} else if (hour<=6&&''==mer){
		 			hour += 12;
				}
				var tz = (regexMer.test(parse[2])) ? parse[3] : parse[2];
				if(tz){
					var remoteTZO = getTimezone(tz);
					localDate.setUTCHours(hour-remoteTZO);
				} else {
					localDate.setHours(hour);
				}
				localDate.setMinutes(minute);
			}
			break; // end 'at' case
		case 'now': // same as default
		default: 
			// take no action.
	} // endswitch
	
	return localDate;
}

function getTimezone(str){
	var retVal;
	if(/(\-|\+)?\d+/.test(str)){
		return Number(str);
	}
	var now = new Date;
	switch(str.toLowerCase()){
		case 'eastern':
			retVal = now.isDST() ? -4 : -5;
			break;
		case 'edt':
			retVal = -4;
			break;
		case 'est':
			retVal = -5;
			break;
		case 'central':
			retVal = now.isDST() ? -5 : -6;
			break;
		case 'cdt':
			retVal = -5;
			break;
		case 'cst':
			retVal = -6;
			break;
		case 'mountain':
			retVal = now.isDST() ? -6 : -7;
			break;
		case 'mdt':
			retVal = -6;
			break;
		case 'mst':
			retVal = -7;
			break;
		case 'pacific':
			retVal = now.isDST() ? -7 : -8;
			break;
		case 'pdt':
			retVal = -7;
			break;
		case 'pst':
			retVal = -8;
			break;
		case 'gmt': // same as
		case 'utc':
			retVal = 0;
			break;
		default:
			// return current TZO
			retVal = -now.getTimezoneOffset()/60;
	} // endswitch
	return retVal;
}

function clock(offset){
	var localDate = adjustDate(); 
	if (localDate.isDST() && offset != -10) {
		offset++;
	}
	var hour = localDate.getUTCHours() + offset;
	if(hour < 0){
		hour+=24;
	} else if(hour > 24){
		hour-=24;
	}
	var minute = localDate.getUTCMinutes();
	var meridian = (hour < 12) ? 'AM' : 'PM';
	if(hour > 12){
		hour-=12;
	} else if(hour<=0){
		hour = "12";
	}
	if(minute < 10){
		minute = "0" + minute;
	}
	return "<strong>" + hour + ":" + minute + "</strong>" + meridian;
}

function fWhen(obj){
	obj.style.color='#000';
	if('now' == obj.value){
		obj.value='';
	}
}
function bWhen(obj){
	if('' == obj.value || 'now' == obj.value){
		obj.value = 'now';
		obj.style.color = '#666';
	}
}

window.onload=function(){
	var when = $('when');
	var hash = window.location.hash;
	hash = hash.replace(/\#/g,'');
	if(!!hash){
		when.value = hash.replace(/\-+/g,' ').trim();
	}
	when.listen('change',function(e){
		window.location.hash = when.value.trim().replace(/\s+/g,'-');
	});
	$("Anchorage").periodic(function(){this.update(clock(-9));},1000,true);
	$("Honolulu").periodic(function(){this.update(clock(-10));},1000,true);
	$("LosAngeles").periodic(function(){this.update(clock(-8));},1000,true);
	$("Denver").periodic(function(){this.update(clock(-7));},1000,true);
	$("Chicago").periodic(function(){this.update(clock(-6));},1000,true);
	$("NewYork").periodic(function(){this.update(clock(-5));},1000,true);
};
