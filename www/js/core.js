function onBodyLoad() {
	document.addEventListener("deviceready", go, false);
}

var localFileName;	// the filename of the local mbtiles file
var remoteFile;		// the url of the remote mbtiles file to be downloaded
var msg;			// the span to show messages

localFileName = 'test.mbtiles';
remoteFile = 'http://dl.dropbox.com/u/14814828/OSMBrightSLValley.mbtiles';

function go() {
	var fs;				// file system object
	var ft;				// TileTransfer object

	msg = document.getElementById('message');
	
	console.log('requesting file system...');
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
		console.log('file system retrieved.');
		fs = fileSystem;

		// check to see if files already exists
		var file = fs.root.getFile(localFileName, {create: false}, function () {
			// file exists
			console.log('exists');

			msg.innerHTML = 'File already exists on device. Building map...';

			buildMap();
		}, function () {
			// file does not exist
			console.log('does not exist');

			msg.innerHTML = 'Downloading file (~14mbs)...';

			console.log('downloading sqlite file...');
			ft = new FileTransfer();
			ft.download(remoteFile, fs.root.fullPath + '/' + localFileName, function (entry) {
				console.log('download complete: ' + entry.fullPath);

				buildMap();

			}, function (error) {
				console.log('error with download', error);
			});
		});
	});
}

function buildMap() {
	var db = new SQLitePlugin(localFileName);

	document.body.removeChild(msg);

	var map = new L.Map('map', {
		center: new L.LatLng(40.6681, -111.9364),
		zoom: 11
	});

	var lyr = new L.TileLayer.MBTiles('', {maxZoom: 14, scheme: 'tms'}, db);

	map.addLayer(lyr);
}