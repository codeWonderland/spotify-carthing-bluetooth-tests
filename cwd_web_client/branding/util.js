

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function range(a,b){
	// if only one argument supplied then return random number between 0 and argument
	if (b === undefined) {
		b = a;
		a = 0;
	}
	return [...Array(b-a).keys()].map(x => x+a);
}
