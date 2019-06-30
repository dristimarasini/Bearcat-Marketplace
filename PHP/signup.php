<html>
<head>
<?php
$sid = $_POST['stdID'];
$password = $_POST['password'];
$status = true;
if($sid == ""|| $password == "" )
{
    header('Refresh: 2; url=signup.html');
    echo "Error! Text field cannot be blank. Try again";
    $status = false;
}else{
?>
<title><?php
if ($status){
    echo "Welcome to BearCatMarketPlace";
} else {
    echo "Bearcat Registration";
}
?></title>
</head>
<body>
    <?php
    
    $con = mysqli_connect('localhost', 'root', '', 'bearcat');
    if (!$con) {
        echo "<p style='color:green;'>Error connecting to database: </p>" .mysqli_error($con);
        exit();
    }
    $query = "select  sid from students where sid = '".$sid."'";
    $sol = mysqli_query($con, $query);
    $numberofrows = mysqli_num_rows($sol);
    if ($numberofrows !== 0) {
        header('Refresh: 2; url=signup.html');
        echo "SID already exists. Try again";
    } else {
        $reg = "INSERT INTO students(sid, password) values('".$sid."', '".$password."');";
        mysqli_query($con, $reg);
        header('Refresh: 2; url=index.html');
    }
}