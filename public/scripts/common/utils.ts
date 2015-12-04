function generateRandomNumber(min:number, max:number):number
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentTimestamp():number
{
	return Math.floor(Date.now() / 1000);
}