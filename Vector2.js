var Vector2= function (nX,nY)
{
		this.x = 0;
		this.n = 0;
}

Vector2.prototype.Magnitude = function()
{
	var mag = this.x*this.x + this.y*this.y
	mag = Math.sqrt(mag);
	return mag;
}
//destructive
Vector2.prototype.Normalize = function () //this make this vector normalized
{
	var mag = this.Magnitude();
	this.x = this.x / mag;
	this.y = this.y / mag;
}
//non destructive
Vector2.prototype.GetNormal = function () //returns a new vector 2 that is a normalized version
{
		var mag = this.Magnitude();
		var v2 = new Vector2(0,0);

		v2.x = this.x / mag;
		v2.y = this.y / mag;

		return v2;
}

Vector2.prototype.set = function(nX,nY)
{
	this.x = nX;
	this.y = nY;
}

Vector2.prototype.Add = function (other)
{
	this.x += other.x;
	this.y += other.y;
}

Vector2.prototype.Subtract = function (other)
{
	this.x -= other.x;
	this.y -= other.y;
}

Vector2.prototype.Multiple = function (Scalar)
{
	this.x *= scalar;
	this.y *= scalar;
}

Vector2.prototype.divide = function (Scalar)
{
	this.x /= scalar;
	this.y /= scalar;
}