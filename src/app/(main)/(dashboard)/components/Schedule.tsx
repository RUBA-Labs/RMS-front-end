// "use client";

// import React, { useState, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// // import timeGridPlugin from "@fullcalendar/timegrid";
// // import interactionPlugin, { DateSelectArg, EventClickArg } from "@fullcalendar/interaction";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// type CalEvent = {
//   id: string;
//   title: string;
//   start: string;
//   end?: string;
//   allDay?: boolean;
// };

// const Schedule: React.FC = () => {
//   const [events, setEvents] = useState<CalEvent[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
//   const [newEventTitle, setNewEventTitle] = useState<string>("");
//   const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedEvents = localStorage.getItem("events");
//       if (savedEvents) {
//         setEvents(JSON.parse(savedEvents));
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("events", JSON.stringify(events));
//     }
//   }, [events]);

//   const handleDateClick = (selected: DateSelectArg) => {
//     setSelectedDate(selected);
//     setIsDialogOpen(true);
//   };

//   const handleEventClick = (selected: EventClickArg) => {
//     if (window.confirm(`Are you sure you want to delete the event "${selected.event.title}"?`)) {
//       setEvents((prev) => prev.filter((evt) => evt.id !== selected.event.id));
//     }
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setNewEventTitle("");
//   };

//   const handleAddEvent = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newEventTitle && selectedDate) {
//       setEvents((prev) => [
//         ...prev,
//         {
//           id: `${selectedDate.startStr}-${newEventTitle}`,
//           title: newEventTitle,
//           start: selectedDate.startStr,
//           end: selectedDate.endStr,
//           allDay: selectedDate.allDay,
//         },
//       ]);
//       handleCloseDialog();
//     }
//   };

//   return (
//     <div>
//       <div className="flex w-full px-10 justify-start items-start gap-8">
//         <div className="w-3/12">
//           <div className="py-10 text-2xl font-extrabold px-7">Calendar Events</div>
//           <ul className="space-y-4">
//             {events.length === 0 && (
//               <div className="italic text-center text-gray-400">No Events Present</div>
//             )}
//             {events.length > 0 &&
//               events.map((event) => (
//                 <li
//                   className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
//                   key={event.id}
//                 >
//                   {event.title}
//                   <br />
//                   <label className="text-slate-950">
//                     {event.start}
//                   </label>
//                 </li>
//               ))}
//           </ul>
//         </div>
//         <div className="w-9/12 mt-8">
//           <FullCalendar
//             height={"85vh"}
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             headerToolbar={{
//               left: "prev,next today",
//               center: "title",
//               right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
//             }}
//             initialView="dayGridMonth"
//             editable={true}
//             selectable={true}
//             selectMirror={true}
//             dayMaxEvents={true}
//             select={handleDateClick}
//             eventClick={handleEventClick}
//             events={events}
//           />
//         </div>
//       </div>
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add New Event Details</DialogTitle>
//           </DialogHeader>
//           <form className="space-x-5 mb-4" onSubmit={handleAddEvent}>
//             <input
//               type="text"
//               placeholder="Event Title"
//               value={newEventTitle}
//               onChange={(e) => setNewEventTitle(e.target.value)}
//               required
//               className="border border-gray-200 p-3 rounded-md text-lg"
//             />
//             <button className="bg-green-500 text-white p-3 mt-5 rounded-md" type="submit">
//               Add
//             </button>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Schedule;
