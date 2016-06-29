var Coin = function(x, y)
{
	this.sprite = new Sprite("coins.png");
	this.sprite.buildAnimation(1, 4, 39, 44, 0.10, [0,1,2,3]);
	this.sprite.setAnimationOffset(0,0,5);

	this.position = new Vector2();
	this.position.set(x, y);

	this.velocity = new Vector2();
}

Coin.prototype.update = function(deltaTime)
{
	this.sprite.update(deltaTime);
}

Coin.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
}