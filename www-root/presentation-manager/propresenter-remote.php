<!-- Webpage that can be used as a remote control for ProPresenter instead of the hardware clicker -->
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ProPresenter Remote</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

<!-- Bootstrap 4 -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

<script type="text/javascript">
/* <![CDATA[ */
function getRequest(url) {
	var jqXhr = $.ajax(url, {
		type: 'GET',
		dataType: 'json',
		data: {},
	}).done(function(data, textStatus, xhr) {
		console.dir(data);
		if (xhr.status != 200) {
			$('.status').html('Some error...');
		} else {
		}
	}).fail(function(xhr, status, httpStatus) {
		$('.status').html('The request to the server failed. You might want to try again.');
		if (xhr.status != 200) {
		} else {
		}
	});
}
/* ]]> */
</script>

</head>
<body>

<div class="status"></div>

<button onclick="getRequest('/presentation-manager/propresenter-command.php?act=prev-slide');return false;" style="font-size: 300%; width: 100%; padding-top: 30px; padding-bottom: 30px">Previous</button>

<br><br><br><br>

<button onclick="getRequest('/presentation-manager/propresenter-command.php?act=next-slide');return false;" style="font-size: 300%; width: 100%; padding-top: 30px; padding-bottom: 30px">Next</button>

<br><br><br><br>

<button onclick="getRequest('/presentation-manager/propresenter-command.php?act=clear-slide');return false;" style="font-size: 300%; width: 100%; padding-top: 30px; padding-bottom: 30px">Clear slide</button>


</body>
</html>
