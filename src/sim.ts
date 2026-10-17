/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*\
|																															 |
|												object definitions										 |
|																															 |
\*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//field object to hold state variables:
function Field(this: Field, nx, ny) {
	this.nx = nx;
	this.ny = ny;
	this.val = new Float32Array(this.nx * this.ny);

	//functions to compute field derivatives:

	this.DX = DX;
	function DX() {
		//Compute the x derivative, 4th order accurate, one sided near boundaries
		//This function does not compute the derivative on the boundary points
		//	since those are assumed to be handled via the boundary condition.

		var DXvals = new Field(this.nx, this.ny);

		var index;
		//Interior points:
		for (var j = 0; j < this.ny; j++) {
			for (var i = 2; i < this.nx - 2; i++) {
				index = i + this.nx * j;
				DXvals.val[index] =
					(this.val[index - 2] -
						8 * this.val[index - 1] +
						8 * this.val[index + 1] -
						this.val[index + 2]) /
					12;
			}
		}

		//Points 1 from the boundary:
		var i = 1;
		for (var j = 0; j < this.ny; j++) {
			index = i + this.nx * j;
			DXvals.val[index] =
				(-3 * this.val[index - 1] -
					10 * this.val[index] +
					18 * this.val[index + 1] -
					6 * this.val[index + 2] +
					this.val[index + 3]) /
				12;
		}
		var i = this.nx - 2;
		for (var j = 0; j < this.ny; j++) {
			index = i + this.nx * j;
			DXvals.val[index] =
				(3 * this.val[index + 1] +
					10 * this.val[index] -
					18 * this.val[index - 1] +
					6 * this.val[index - 2] -
					this.val[index - 3]) /
				12;
		}

		return DXvals;
	}

	this.DY = DY;
	function DY() {
		//Compute the y derivative, 4th order accurate, one sided near boundaries
		//This function does not compute the derivative on the boundary points

		var DYvals = new Field(this.nx, this.ny);

		var index;
		//Interior points:
		for (var j = 2; j < this.ny - 2; j++) {
			for (var i = 0; i < this.nx; i++) {
				index = i + this.nx * j;
				DYvals.val[index] =
					(this.val[index - 2 * this.nx] -
						8 * this.val[index - this.nx] +
						8 * this.val[index + this.nx] -
						this.val[index + 2 * this.nx]) /
					12;
			}
		}

		//Points 1 from the boundary:
		var j = 1;
		for (var i = 0; i < this.nx; i++) {
			index = i + this.nx * j;
			DYvals.val[index] =
				(-3 * this.val[index - this.nx] -
					10 * this.val[index] +
					18 * this.val[index + this.nx] -
					6 * this.val[index + 2 * this.nx] +
					this.val[index + 3 * this.nx]) /
				12;
		}
		var j = this.ny - 2;
		for (var i = 0; i < this.nx; i++) {
			index = i + this.nx * j;
			DYvals.val[index] =
				(3 * this.val[index + this.nx] +
					10 * this.val[index] -
					18 * this.val[index - this.nx] +
					6 * this.val[index - 2 * this.nx] -
					this.val[index - 3 * this.nx]) /
				12;
		}

		return DYvals;
	}

	this.Draw = Draw;
	function Draw(canvas, ctx, lower, upper) {
		//Clear and resize the canvas
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		//reset the transformation:
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(canvas.width / (this.nx - 1), canvas.height / (this.ny - 1));

		//image:
		var imgData = ctx.createImageData(this.nx, this.ny);

		//colormap (from c1 to c2):
		var c1 = [0, 0, 60]; //lower color
		var c2 = [178, 194, 240]; //upper color

		var w;
		for (var i = 0; i < imgData.data.length; i += 4) {
			w = (this.val[i / 4] - lower) / (upper - lower);
			imgData.data[i + 0] = Math.round((1 - w) * c1[0] + w * c2[0]);
			imgData.data[i + 1] = Math.round((1 - w) * c1[1] + w * c2[1]);
			imgData.data[i + 2] = Math.round((1 - w) * c1[2] + w * c2[2]);
			imgData.data[i + 3] = 255;
		}
		ctx.putImageData(imgData, 0, 0);
		ctx.drawImage(canvas, 0, 0);
	}
}
//Prototype functions for the Field class for common operations (addition, subtraction, etc)
Field.prototype = {
	//set the calling Field equal to "b"
	equals: function (b) {
		if (typeof b === "number") {
			for (var i = 0; i < this.nx * this.ny; i++) {
				this.val[i] = b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny)
				throw "Error in Field assignment, Fields must have same size.";

			for (var i = 0; i < this.nx * this.ny; i++) {
				this.val[i] = b.val[i];
			}
		}
	},
	//add "b" to the calling Field
	add: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] + b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny)
				throw "Error in Field addition, Fields must have same size.";

			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] + b.val[i];
			}
		}
		return c;
	},
	//subtract "b" from the calling Field
	subtract: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] - b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny)
				throw "Error in Field subtraction, Fields must have same size.";

			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] - b.val[i];
			}
		}
		return c;
	},
	//multiply the calling Field by "b"
	multiply: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] * b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny)
				throw "Error in Field multiplication, Fields must have same size.";

			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] * b.val[i];
			}
		}
		return c;
	},
	//divide the calling Field by "b"
	divide: function (b) {
		if (typeof b === "number") {
			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] / b;
			}
		} else {
			if (this.nx != b.nx || this.ny != b.ny)
				throw "Error in Field division, Fields must have same size.";

			var c = new Field(this.nx, this.ny);

			for (var i = 0; i < this.nx * this.ny; i++) {
				c.val[i] = this.val[i] / b.val[i];
			}
		}
		return c;
	},
	//negate the Field
	negate: function () {
		var c = new Field(this.nx, this.ny);

		for (var i = 0; i < this.nx * this.ny; i++) {
			c.val[i] = -this.val[i];
		}
		return c;
	},
};

//Object to hold the simulation state and methods for the shallow water equations
export class SimState {
	nx: number;
	ny: number;
	H: number;
	dt: number;

	eta: Field;
	u: Field;
	v: Field;
	t: number;

	constructor(state: SimState);
	constructor(nx: number, ny: number, H: number, dt: number);

	constructor(nx: SimState | number, ny?: number, H?: number, dt?: number) {
		if (nx instanceof SimState) {
			//The first parameter passed in is an instance of the SimState class, duplicate it:
			// In this case, the variable "nx" is actually a SimState variable rather than the
			// number of points in the x direction. I know, it's confusing.

			//parameters
			this.nx = nx.nx;
			this.ny = nx.ny;
			this.H = nx.H;
			this.dt = nx.dt;

			//state variables
			this.t = nx.t;
			this.eta = new Field(this.nx, this.ny); //disturbance height
			this.u = new Field(this.nx, this.ny); //u velocity
			this.v = new Field(this.nx, this.ny); //v velocity
			this.eta.equals(nx.eta);
			this.u.equals(nx.u);
			this.v.equals(nx.v);
		} else {
			//parameters
			this.nx = nx;
			this.ny = ny;
			this.H = H;
			this.dt = dt;

			//state variables
			this.t = 0;
			this.eta = new Field(this.nx, this.ny);
			this.u = new Field(this.nx, this.ny);
			this.v = new Field(this.nx, this.ny);
		}
	}

	RHS(state, deta, du, dv) {
		//Compute the right hand side of for the simulation
		deta.equals(state.u.DX().add(state.v.DY()).multiply(-state.H));
		du.equals(state.eta.DX());
		dv.equals(state.eta.DY());

		//Artificial diffusion (for stability and smoothing):
		deta.equals(deta.add(du.DX().add(dv.DY()).multiply(2)));
	}

	Step(mouseState, canvas) {
		//Midpoint (RK2) time step
		var deta = new Field(this.eta.nx, this.eta.ny);
		var du = new Field(this.u.nx, this.u.ny);
		var dv = new Field(this.v.nx, this.v.ny);

		this.RHS(this, deta, du, dv);

		//half step:
		var tmpState = new SimState(this);
		tmpState.eta.equals(this.eta.add(deta.multiply(this.dt / 2)));
		tmpState.u.equals(this.u.add(du.multiply((-9.81 * this.dt) / 2)));
		tmpState.v.equals(this.v.add(dv.multiply((-9.81 * this.dt) / 2)));
		tmpState.BoundaryConditions();

		this.RHS(tmpState, deta, du, dv);

		//full step:
		this.eta.equals(this.eta.add(deta.multiply(this.dt)));
		this.u.equals(this.u.add(du.multiply(-9.81 * this.dt)));
		this.v.equals(this.v.add(dv.multiply(-9.81 * this.dt)));
		this.BoundaryConditions();

		//mouse events:
		if (mouseState.clicking && !mouseState.ignore) {
			//normalize mouse coordinates to simulation coordinates
			var i = Math.floor((mouseState.x / canvas.width) * this.nx);
			var j = Math.floor((mouseState.y / canvas.height) * this.ny);

			var expTerm1;
			var expTerm2;
			for (var jj = 0; jj < this.ny; jj++) {
				for (var ii = 0; ii < this.nx; ii++) {
					//Mouse makes the surface approach this shape (2d Gaussian):
					expTerm1 = Math.exp(
						(-Math.pow(ii - i, 2) - Math.pow(jj - j, 2)) * mouseState.size,
					);

					//Mouse influence decays at this rate (2d Gaussian):
					expTerm2 = Math.exp(
						((-Math.pow(ii - i, 2) - Math.pow(jj - j, 2)) * mouseState.size) /
							10,
					);

					this.eta.val[ii + this.nx * jj] +=
						25 *
						(expTerm1 - this.eta.val[ii + this.nx * jj]) *
						this.dt *
						expTerm2;
				}
			}
		}

		this.t += this.dt;
	}

	BoundaryConditions() {
		//Apply reflecting boundary conditions on all sides:
		var index;
		var decay = 0.95; // use the boundaries to introduce height decay

		//Left:
		for (index = 0; index < this.nx * this.ny; index += this.nx) {
			this.eta.val[index] = decay * this.eta.val[index + 1];
			this.u.val[index] = -decay * this.u.val[index + 1];
			this.v.val[index] = decay * this.v.val[index + 1];
		}

		//Right:
		for (index = this.nx - 1; index < this.nx * this.ny; index += this.nx) {
			this.eta.val[index] = decay * this.eta.val[index - 1];
			this.u.val[index] = -decay * this.u.val[index - 1];
			this.v.val[index] = decay * this.v.val[index - 1];
		}

		//Bottom:
		for (index = 0; index < this.nx; index++) {
			this.eta.val[index] = decay * decay * this.eta.val[index + this.nx];
			this.u.val[index] = decay * this.u.val[index + this.nx];
			this.v.val[index] = -decay * this.v.val[index + this.nx];
		}

		//Top:
		for (index = this.nx * (this.ny - 1); index < this.nx * this.ny; index++) {
			this.eta.val[index] = decay * this.eta.val[index - this.nx];
			this.u.val[index] = decay * this.u.val[index - this.nx];
			this.v.val[index] = -decay * this.v.val[index - this.nx];
		}
	}
}
