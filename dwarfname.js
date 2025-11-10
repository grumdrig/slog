function generateName() {
	const frequencies = {
	V: [
		],
	v: [
		[0.25000, 'ee'],
		[0.25000, 'a'],
		[0.25000, 'o'],
		[0.25000, 'u'],
		],
	w: [
		[0.80000, 'y'],
		[0.20000, 'ey'],
		],
	C: [
		[0.14286, 'sn'],
		[0.14286, 'sl'],
		[0.14286, 'h'],
		[0.28571, 'd'],
		[0.14286, 'gr'],
		[0.14286, 'b'],
		],
	c: [
		[0.16667, 'z'],
		[0.33333, 'p'],
		[0.16667, 'pp'],
		[0.16667, 'mp'],
		[0.16667, 'shf'],
		],
	k: [
		[0.50000, 'c'],
		[0.50000, 'l'],
		],
	}
	const patterns = [
		[0.71429, 'Cvcw'],
		[0.14286, 'Cvk'],
		[0.14286, 'Cvcvk'],
		];

	function pickp(a) {
		let r = Math.random();
		for (let [frequency, value] of a) {
			r -= frequency;
			if (r <= 0) return value;
		}
		return '';  // shouldn't happen, but
	}

	let result = '';
	let pat = pickp(patterns);
	for (let p of pat) {
		result += pickp(frequencies[p]);
	}
	return result[0].toUpperCase() + result.slice(1);
}


if (typeof require !== 'undefined' &&
    typeof module !== 'undefined' &&
    require.main === module) {
	console.log(generateName());
}