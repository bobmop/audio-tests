
function doit() {

	var context = new AudioContext(),
		player = document.getElementById("myaudio"),
		playing = false,
		audio_file = document.getElementById("audio_file"),
		bars = document.getElementById("bars"),
		barsContext = bars.getContext("2d"),
		maxBars = 20,
		sourceNode = context.createMediaElementSource(player),
		diagram;


	analyser = context.createAnalyser();
	analyser.fftSize = 2048;
//	analyser.minDecibels = -90;
//	analyser.maxDecibels = -10;
	analyser.smoothingTimeConstant = 0.85;

	sourceNode.connect(analyser);
	sourceNode.connect(context.destination);
	rafID = window.requestAnimationFrame(updateVisualization);

	myaudio.addEventListener("play", startInfo, true);
	myaudio.addEventListener("pause", stopInfo, true);

	audio_file.onchange = function() {
		myaudio.src = URL.createObjectURL(this.files[0]);
	};

	barsContext.fillStyle = "white";


	function drawBars(array) {

		// clear the current state
		barsContext.clearRect(0, 0, bars.width, bars.height);

		// draw the middle line
		barsContext.fillStyle = "white";
		barsContext.fillRect(0, bars.height / 2, bars.width, 1);

		// how many values are one bar
		var chunkSize = Math.floor(array.length / maxBars),
			barValues = [],
			maxValue = 0;

		for (var i = 0; i < maxBars; i++) {

			// tmp array for the current bar
			var arrayValues = array.subarray(i * chunkSize, (i+1) * chunkSize),
				arrayValueIterator = arrayValues.entries(),
				barValue = 0;
			for (var v of arrayValueIterator) {
				barValue += v[1];
			}

			barValues.push(barValue);

			// find the maximum value
			maxValue = Math.max(barValue, maxValue);
		}

		var barWidth = bars.width / maxBars;

		// factor for the maxValue related to bars.height
		var heightFactor = maxValue / bars.height;

		barValues.reduce(function(_, current, index) {
			var value = current / heightFactor;
			barsContext.fillRect(barWidth * (index -1), bars.height/2 - value/2, barWidth , value);
		});

	}

	function updateVisualization() {
		if (playing) {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData (array);
			drawBars(array);
			rafID = window.requestAnimationFrame(updateVisualization);
		}
	}

	function startInfo() {
		playing = true;
		updateVisualization();
	}

	function stopInfo() {
		playing = false;
	}

}
window.onload = doit;
