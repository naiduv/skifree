
function randomsign()
{
	if(Math.random()*10<=5)
		return -1;
	else
		return 1;
}

function myrand(max)
{
	return randomsign()*Math.floor((Math.random()*max));
}

//unsigned rand
function myurand(max)
{
	return Math.floor((Math.random()*max));
}

function round(num)
{
	return (Math.round(num*100)/100);
}