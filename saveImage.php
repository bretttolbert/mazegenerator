<?php
header("Content-Type: application/json");
echo '{';
if (isset($_POST["canvasData"]))
{
    $imageData=$_POST["canvasData"];
    // Remove the headers (data:,) part.  
    // A real application should use them according to needs such as to check image type
    $filteredData=substr($imageData, strpos($imageData, ",")+1);
    $unencodedData=base64_decode($filteredData);
	$maxTempFiles = 100;
	// Generate random filename, e.g. "temp/temp_04.png"
	// Using a random filename is better than using a static filename because it means the
	// temp file will be less likely to be immediately overwritten by another user.
	$randVal = rand(0,$maxTempFiles-1);
	$numDigits = floor(log($maxTempFiles-1, 10)) + 1; //number of digits in the filename
	$filename = 'temp/temp_' . str_pad($randVal, $numDigits, "0", STR_PAD_LEFT) . '.png';
	echo '"filename":"' . $filename . '",';
    $fp = fopen($filename, 'wb');
    fwrite($fp, $unencodedData);
    fclose($fp);
	echo '"wasSuccessful":true,';
}
else
{
	echo '"wasSuccessful":false,';
	echo '"errorMessage":"Error: missing required POST parameter canvasData",';
}
echo '"foo":"bar"}';
?>