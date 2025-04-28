import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useLocationGranted = () => {
    const [locationGranted, setLocationGranted] = useState(false);

    useEffect(() => {
        toast.dismiss();
        if (navigator.geolocation) {
            // Request location permission
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // If permission is granted, set locationGranted to true
                    setLocationGranted(true);
                    console.log("Location granted:", position);
                },
                (error) => {
                    // If there's an error (e.g., permission denied), handle it here
                    setLocationGranted(false);
                    if (error.code === error.PERMISSION_DENIED) {
                        toast.error("We need access to your location to continue. Please enable location services.");
                    } else {
                        toast.error("Unable to retrieve location. Please try again.");
                    }
                }
            );
        } else {
            toast.error("Your browser does not support location access.");
        }
    }, []);

    return locationGranted;
};
