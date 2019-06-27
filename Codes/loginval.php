
<html>
<head>
<?php



// Passing the input values
$username = $_POST['stdID'];
$password = $_POST['password'];


$status = true;

if($username == "" || $password == "")
{
    echo "Error! Text field cannot be blank";
    $status = false;
}

?>
<title><?php
if ($status){
    echo "Welcome to BearcatMarketPlace";
} else {
    echo "BearcatMarketPlce Login";
}
?></title>
</head>


<body>
    <?php
    
    $con = mysqli_connect('localhost', 'root', '', 'bearcat');

    if (!$con) {
        echo "<p style='color: green;'>Error connecting to database: </p>" .mysqli_error($con);
        exit();
    }

    $query = "select * from students where sid = '".$username."' && password = '".$password."'";
    $sol = mysqli_query($con, $query);
    $numberofrows = mysqli_num_rows($sol);

    if ($numberofrows == 1) {           //if credentials match
        header('Location: indextest.html');         // redirects to home page of emart
    } else {
        
        header('Refresh: 2; url=index.html');
       echo "Wrong Username or Password. Try Again.";
    }

    ?>
