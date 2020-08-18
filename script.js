$(document).ready(function () {
    //cityName to hold the user input
    var cityName = "";
    //latitude and longitude are retrieved in first API and needed for second API call
    var lat = "";
    var lon = "";

    //function that gets the rest of the current weather and the daily weather
    function getWeatherOneAPI(a,b) {
        var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + a + "&lon=" + b + "&exclude=minutely,hourly&appid=aec299195260a001b09706b5bfe740f7&units=imperial";

        //second API call to get the rest of the current weather data along with the 5 day forecast
        $.ajax({
            url: queryURL2,
            method: "GET"
        }).then(function (response) {
            console.log(response);

            //ensures the 5-day forecast is removed before displaying the next city's data
            $(".card-deck").empty();

            //gets the weather icon and appends it the page
            var icon = response.current.weather[0].icon;
            var iconImg = $("<img>");
            iconImg.addClass("img-fluid");
            iconImg.attr("src", "https://openweathermap.org/img/wn/" + icon + "@2x.png")
            $("#city").append(iconImg);

            //if statement to update the background color of the UV Index
            var uvi = parseInt(response.current.uvi);
            if (uvi <= 2) {
                $(".color").css({ "background-color": "green", "color": "white" });
            } else if (uvi >= 3 && uvi <= 5) {
                $(".color").css({ "background-color": "yellow", "color": "black" });
            } else if (uvi >= 6 && uvi <= 7) {
                $(".color").css({ "background-color": "orange" });
            } else if (uvi >= 8 && uvi <= 10) {
                $(".color").css({ "background-color": "red", "color": "white" });
            } else if (uvi >= 11) {
                $(".color").css({ "background-color": "violet", "color": "white" });
            }

            //populates the corresponding html IDs with the current weather data
            $("#temp").text("Temperature: " + response.current.temp + "° F");
            $("#humidity").text("Humidity: " + response.current.humidity + "%");
            $("#wind").text("Wind Speed: " + response.current.wind_speed + " MPH");
            $(".color").text(response.current.uvi);

            //displays the html to the user
            $("#current").css({"display":"block"});

            //array for the daily response
            var daily = response.daily;

            //for loop to loop through the daily response array
            for (i = 1; i < daily.length - 2; i++) {
                //saves each response in a variable
                var dailyDate = moment.unix(daily[i].dt).format("dddd MM/DD/YYYY");
                var dailyTemp = daily[i].temp.day;
                var dailyHum = daily[i].humidity;
                var dailyIcon = daily[i].weather[0].icon;

                //creates dynamic elements
                var dailyDiv = $("<div class='card text-white bg-primary p-2'>")
                var pTemp = $("<p>");
                var pHum = $("<p>");
                var imgIcon = $("<img>");
                var hDate = $("<h6>");

                //adds text to the dynamic elements
                hDate.text(dailyDate);
                imgIcon.attr("src", "https://openweathermap.org/img/wn/" + dailyIcon + "@2x.png")
                imgIcon.addClass("img-fluid");
                imgIcon.css({"width": "100%"});
                pTemp.text("Temp: " + dailyTemp + "° F");
                pHum.text("Humidity: " + dailyHum + "%");

                //appends the dynamic elements to the html
                dailyDiv.append(hDate);
                dailyDiv.append(imgIcon);
                dailyDiv.append(pTemp);
                dailyDiv.append(pHum);
                $(".card-deck").append(dailyDiv);

                //displays this html to the user
                $("#five-day").css({"display":"block"});
            }

        })
    }

    //function that uses the city user input to make an API call
    function getWeather() {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&lang=en&appid=aec299195260a001b09706b5bfe740f7";

        //first API call to get the lat and lon
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //stores the coordinates for lat and lon from the API response
            lat = response.coord.lat;
            lon = response.coord.lon;

            //adds the city name and date to the html for the current weather
            $("#city").text(response.name);
            $("#date").text(moment.unix(response.dt).format("dddd, MM/DD/YYYY"));
                        
            //saves the city name to local storage
            localStorage.setItem("cityname", response.name);
            
            //passing the coordinates to the next function
            getWeatherOneAPI(lat,lon);

        })
    }

    //function to display the last searched city's data
    function init(){
        cityName = localStorage.getItem("cityname");
        if (cityName !== null) {

            var cityList = $("<button>");
            cityList.addClass("list-group-item list-group-item-action");
            cityList.text(cityName);
            $("ul").prepend(cityList);
            getWeather()
        }
    }

    function searchButton() {
        cityName = $("input").val().trim();

        //buttons are created dynamically as the user enters more cities to search
        var cityList = $("<button>");
        cityList.addClass("list-group-item list-group-item-action");
        cityList.text(cityName);

        //buttons are added to the list in the sidebar
        $("ul").prepend(cityList);
        //after the user's city is saved to the list, the input field is cleared out
        $("input").val("");

        getWeather();
    }

    init();

    //submit event for when the users enter the city search term
    $("#city-form").submit(function (event) {
        event.preventDefault();
        searchButton();
    })

    $("#form-submit").click(function (event) {
        event.preventDefault();
        searchButton();
    })

    //click event listener for when the user clicks on a city in the history list
    $("ul").on("click", "button", function () {
        cityName = $(this).text();
        console.log(cityName);

        getWeather();
    })

    //error handling for when an incorrect city is typed
    $( document ).ajaxError(function() {
        //creates a dynamic paragraph element
        var error = $("<p>");
        error.addClass("error");
        error.css({"color": "red"});
        error.text("Please try again with a valid city");
        //prepends the error message below the text field
        $("ul").prepend(error);
        //find the button just created with the incorrect city name
        var p = $(this).find("button");
        //removes the button with the incorrect name
        p[1].remove();
        //error message goes away after 2 seconds
        setTimeout(function () {
            error.remove();
            }, 2000);
      });

})
