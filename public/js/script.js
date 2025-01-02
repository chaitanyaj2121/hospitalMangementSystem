getLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error('Error: User denied the request for Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error(
                'Error: Location information is unavailable. Check your network or device settings.'
              );
              break;
            case error.TIMEOUT:
              console.error('Error: The request to get user location timed out.');
              break;
            default:
              console.error('Error: An unknown error occurred.', error.message);
          }
        },
        {
          enableHighAccuracy: true, // Requests high-accuracy GPS data (useful for mobile devices)
          timeout: 10000, // Wait up to 10 seconds for the location
          maximumAge: 0, // Always fetch fresh data
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  });
  