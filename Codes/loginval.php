
<html>
<head>
<?php



// Passing the input values
$Sid = $_POST['SID'];
$password = $_POST['password'];


$status = true;

if($Sid == "" || $password == "")
{
    echo "Error! Text field cannot be blank";
    $status = false;
}

?>
<title><?php
if ($status){
    echo "Welcome to Bearcat marketplace";
} else {
    echo "Bearcat Login";
}
?></title>
</head>


<body>
    <?php
    // if (!status) {
    //     exit;
    // }
    //database connection
    $con = mysqli_connect('localhost', 'root', '', 'bearcat');

    if (!$con) {
        echo "<p style='color: green;'>Error connecting to database: </p>" .mysqli_error($con);
        exit();
    }

    $query = "select * from students where sid = '".$Sid."' && password = '".$password."'";
    $sol = mysqli_query($con, $query);
    $numberofrows = mysqli_num_rows($sol);

    if ($numberofrows == 1) {           //if credentials match
        header('Location: emart.html');         // redirects to home page of emart
    } else {
        
        header('Refresh: 2; url=login.html');
       echo "Wrong Username or Password. Try Again.";
    }

    ?>
