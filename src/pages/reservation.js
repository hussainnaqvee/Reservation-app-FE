import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Card, CardHeader, CardContent } from "@mui/material";
import { styled, css } from "@mui/system";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const dateMap = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

const SelectDayPage = () => {
  const router = useRouter();
  const { businessId } = router.query;
  const [availability, setAvailability] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    phoneNo: "",
    seatingCapacity: "",
  });
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const fetchData = async (day, futureBookingDate) => {
    if (!businessId) return;
    try {
      const response = await fetch("http://localhost:3001/reservations/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId,
          selectedDay: day ? day : null,
          futureBookingDate: futureBookingDate ? futureBookingDate : null,
        }),
      });

      const data = await response.json();
      console.log("Availability data:", data);
      setAvailability(data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  useEffect(() => {
    if (selectedDay) {
      fetchData(selectedDay);
    }
  }, [selectedDay]);

  useEffect(() => {
    if (selectedTime) {
      setOpenConfirmationDialog(true);
    }
  }, [selectedTime]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const [futureBookingDate, setFutureBookingDate] = useState(null);

  useEffect(() => {
    if (futureBookingDate) {
      fetchData(null, futureBookingDate);
    }
  }, [futureBookingDate]);

  const handleFutureDateChange = (date) => {
    date = new Date(date);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    console.log(new Date(date) + " Selected Date: " + localDate.toISOString().split("T")[0]);
    setFutureBookingDate(localDate.toISOString().split("T")[0]);
    setSelectedDay(dateMap[localDate.getDay()]);
  };

  const [response, setResponse] = useState(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  // setOpenConfirmationDialog(false);
  const handleClose = () => {
    setOpen(false);
    setOpenConfirmationDialog(false);
    router.push(`/`);
  };

  const handleConfirmReservation = async () => {
    if (!selectedDay || !selectedTime || !selectedSlot) {
      alert("Please select all fields before confirming.");
      return;
    }

    console.log("Selected Day:", selectedDay);
    console.log("Selected Time:", selectedTime);

    const reservationPayload = {
      customerName: customerDetails.customerName,
      customerPhoneNo: customerDetails.phoneNo,
      capacity: selectedSlot.SlotCapacity,
      reservationDay: selectedDay,
      reservationTime: selectedTime,
      futureBookingDateTime: futureBookingDate ? futureBookingDate : null,
      slotId: selectedSlot.SlotID,
    };

    try {
      const response = await fetch("http://localhost:3001/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationPayload),
      });

      if (response.ok) {
        const resp = await response.json();
        console.log("Reservation response:", resp);
        setResponse(resp);
        setOpen(true);
      } else {
        setResponse({ message: "Error creating reservation. Please try again." });
      }
    } catch (error) {
      setResponse({ message: "Error submitting reservation" });
      console.error("Error submitting reservation:", error);
    }
  };

  return (
    <div>
      <Card style={{ padding: 20 }}>
        <CardHeader title="Select a Day" />
        <CardContent>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <Button
              key={day}
              variant="outlined"
              sx={{
                borderRadius: "25px",
                margin: "5px",
                padding: "10px 20px",
                textTransform: "capitalize",
                "&:hover": { backgroundColor: "#ddd" },
              }}
              onClick={() => {
                setSelectedDay(day);
                setSelectedSlot(null);
              }}
            >
              {day}
            </Button>
          ))}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box components={["DatePicker"]}>
              <DatePicker label="Future Bookings" onChange={handleFutureDateChange} inputFormat="YYYY-MM-DD" renderInput={(params) => <input {...params} />} />
            </Box>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {availability && selectedDay && (
        <Card style={{ padding: 20 }}>
          <CardHeader title={`Available Slots for ${selectedDay}`} />
          <CardContent>
            {availability.map(
              (slot) =>
                slot &&
                slot?.AvailableTimes && (
                  <Button
                    key={slot.SlotID}
                    variant="outlined"
                    sx={{
                      borderRadius: "25px",
                      margin: "5px",
                      padding: "10px 20px",
                      textTransform: "capitalize",
                      "&:hover": { backgroundColor: "#ddd" },
                    }}
                    onClick={() => handleSlotClick(slot)}
                  >
                    Slot {slot.SlotName} Capacity: {slot.SlotCapacity}
                  </Button>
                )
            )}
          </CardContent>
        </Card>
      )}

      {selectedSlot && selectedSlot?.AvailableTimes && (
        <Card style={{ padding: 20 }}>
          <CardHeader title={`Available Times for Slot ${selectedSlot.SlotName}`} />
          <CardContent>
            {selectedSlot.AvailableTimes.split(", ").map((time, index) => (
              <Button
                key={index}
                variant="outlined"
                sx={{
                  borderRadius: "25px",
                  margin: "5px",
                  padding: "10px 20px",
                  textTransform: "capitalize",
                  "&:hover": { backgroundColor: "#ddd" },
                }}
                onClick={() => {
                  handleTimeClick(time);
                }}
              >
                {time}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={openConfirmationDialog} onClose={() => setOpenConfirmationDialog(false)}>
        <DialogTitle>Confirm Reservation</DialogTitle>
        <DialogContent>
          <TextField label="Customer Name" variant="outlined" fullWidth margin="normal" name="customerName" value={customerDetails.customerName} onChange={handleInputChange} />
          <TextField label="Phone Number" variant="outlined" fullWidth margin="normal" name="phoneNo" value={customerDetails.phoneNo} onChange={handleInputChange} />
          {/* <TextField label="Seating Capacity" variant="outlined" fullWidth margin="normal" name="seatingCapacity" type="number" value={customerDetails.seatingCapacity} onChange={handleInputChange} /> */}
          <p>
            <strong>Reservation Date & Time:</strong> {`${selectedDay} ${selectedTime}`}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmationDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmReservation} color="primary">
            Confirm Reservation
          </Button>
        </DialogActions>
      </Dialog>

      <Modal aria-labelledby="transition-modal-title" aria-describedby="transition-modal-description" open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 200,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <h2 id="transition-modal-title" className="modal-title">
              Reservation Confirmation
            </h2>
            <span id="transition-modal-description" className="modal-description">
              {response?.message} <br />
              Reservation ID: {response?.reservationId}
            </span>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default SelectDayPage;
