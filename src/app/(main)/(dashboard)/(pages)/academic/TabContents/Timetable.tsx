import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Timetable(){

    const upcomingEvent = {
        title: "Introduction to Machine Learning",
        time: "10:00 AM - 12:00 PM",
        location: "Hall 203",
    };

    return(
        <>
        <h1>Timetable</h1>
        
        <p>
            This is the timetable tab content.
        </p>

        
        
        </>
    )
}

    