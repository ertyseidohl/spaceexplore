function windowSize(){
	$('#output').css({'height' : $(window).height() - 80 + "px"});
}

function assert( outcome, errormsg){
	if(!outcome) write('ASSERTION FAILED: ' + errormsg, 'str_debug');
}

function isInteger(num){
	return num | 0 === num;
}

if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

function utilTesting(){
	//ftn for testing stuff. Make sure it is empty before comitting code.
}

function plusMinus(num){
	if(num > 0) return '+';
	return '';
}