export class Field {
	x_size: number;
	y_size: number;
	val: Float32Array;

	constructor(x_size, y_size) {
		this.x_size = x_size;
		this.y_size = y_size;

		this.val = new Float32Array(this.x_size * this.y_size);
	}

	DX() {
		//Compute the x derivative, 4th order accurate, one sided near boundaries
		//This function does not compute the derivative on the boundary points
		//  since those are assumed to be handled via the boundary condition.

		var DXvals = new Field(this.x_size,this.y_size);

		var index;
		//Interior points:
		for (var j=0; j<this.y_size; j++) {
			for (var i=2; i<this.x_size-2; i++) {
				index=i+this.x_size*j;
				DXvals.val[index] = ( this.val[index-2]-8*this.val[index-1]+8*this.val[index+1]-this.val[index+2] )/12;
			}
		}

		//Points 1 from the boundary:
		var i=1;
		for (var j=0; j<this.y_size; j++) {
			index=i+this.x_size*j;
			DXvals.val[index] = ( -3*this.val[index-1]-10*this.val[index]+18*this.val[index+1]-6*this.val[index+2]+this.val[index+3] )/12;
		}
		var i=this.x_size-2;
		for (var j=0; j<this.y_size; j++) {
			index=i+this.x_size*j;
			DXvals.val[index] = ( 3*this.val[index+1]+10*this.val[index]-18*this.val[index-1]+6*this.val[index-2]-this.val[index-3] )/12;
		}

		return DXvals;
	}

	DY() {
		//Compute the y derivative, 4th order accurate, one sided near boundaries
		//This function does not compute the derivative on the boundary points

		var DYvals = new Field(this.x_size,this.y_size);

		var index;
		//Interior points:
		for (var j=2; j<this.y_size-2; j++)
		{
			for (var i=0; i<this.x_size; i++)
			{
				index=i+this.x_size*j;
				DYvals.val[index] = ( this.val[index-2*this.x_size]-8*this.val[index-this.x_size]+8*this.val[index+this.x_size]-this.val[index+2*this.x_size] )/12;
			}
		}

		//Points 1 from the boundary:
		var j=1;
		for (var i=0; i<this.x_size; i++)
		{
			index=i+this.x_size*j;
			DYvals.val[index] = ( -3*this.val[index-this.x_size]-10*this.val[index]+18*this.val[index+this.x_size]-6*this.val[index+2*this.x_size]+this.val[index+3*this.x_size] )/12;
		}
		var j=this.y_size-2;
		for (var i=0; i<this.x_size; i++)
		{
			index=i+this.x_size*j;
			DYvals.val[index] = ( 3*this.val[index+this.x_size]+10*this.val[index]-18*this.val[index-this.x_size]+6*this.val[index-2*this.x_size]-this.val[index-3*this.x_size] )/12;
		}

		return DYvals;

	}

	Draw(canvas,ctx,lower,upper) {
		//Clear and resize the canvas
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		//reset the transformation:
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(canvas.width/(this.x_size-1),canvas.height/(this.y_size-1));

		//image:
		var imgData=ctx.createImageData(this.x_size,this.y_size);

		//colormap (from c1 to c2):
		var c1 = [0, 0, 60]; //lower color
		var c2 = [178, 194, 240]; //upper color

		var w;
		for (var i=0; i<imgData.data.length; i+=4)
		{
			w = (this.val[i/4]-lower)/(upper-lower);
			imgData.data[i+0]=Math.round((1-w)*c1[0]+w*c2[0]);
			imgData.data[i+1]=Math.round((1-w)*c1[1]+w*c2[1]);
			imgData.data[i+2]=Math.round((1-w)*c1[2]+w*c2[2]);
			imgData.data[i+3]=255;
		}
		ctx.putImageData(imgData,0,0);
		ctx.drawImage(canvas,0,0);
	}
}

//Prototype functions for the Field class for common operations (addition, subtraction, etc)
Field.prototype = {
	//set the calling Field equal to "b"
	equals: function (b) {
		if (typeof b === "number") {
			for (var i=0; i<this.nx*this.ny; i++)
			{
				this.val[i] = b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny) throw "Error in Field assignment, Fields must have same size.";

			for (var i=0; i<this.nx*this.ny; i++)
			{
				this.val[i] = b.val[i];
			}
		}
	},
	//add "b" to the calling Field
	add: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++)
			{
				c.val[i] = this.val[i]+b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny) throw "Error in Field addition, Fields must have same size.";

			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++)
			{
				c.val[i] = this.val[i]+b.val[i];
			}
		}
		return c;
	},
	//subtract "b" from the calling Field
	subtract: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++)
			{
				c.val[i] = this.val[i]-b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny) throw "Error in Field subtraction, Fields must have same size.";

			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++)
			{
				c.val[i] = this.val[i]-b.val[i];
			}
		}
		return c;
	},
	//multiply the calling Field by "b"
	multiply: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++) {
				c.val[i] = this.val[i]*b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny) throw "Error in Field multiplication, Fields must have same size.";

			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++) {
				c.val[i] = this.val[i]*b.val[i];
			}
		}
		return c;
	},
	//divide the calling Field by "b"
	divide: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++)
			{
				c.val[i] = this.val[i]/b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny) throw "Error in Field division, Fields must have same size.";

			var c = new Field(this.nx,this.ny);

			for (var i=0; i<this.nx*this.ny; i++)
			{
				c.val[i] = this.val[i]/b.val[i];
			}
		}
		return c;
	},
	//negate the Field
	negate: function () {

		var c = new Field(this.nx,this.ny);

		for (var i=0; i<this.nx*this.ny; i++) {
			c.val[i] = -this.val[i];
		}
		return c;
	}
}
