(() => {
  const form = document.getElementById("consultationForm");
  const status = document.getElementById("formStatus");
  const submitButton = document.getElementById("submitButton");
  if (!form || !status || !submitButton) return;

  const params = new URLSearchParams(window.location.search);
  const selectedTier = params.get("tier");

  const showStatus = (type, message) => {
    status.className = `form-status ${type}`;
    status.textContent = message;
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const goals = data.getAll("goals");
    const payload = {
      fullName: String(data.get("fullName") || "").trim(),
      company: String(data.get("company") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      role: String(data.get("role") || "").trim(),
      monthlyTrips: String(data.get("monthlyTrips") || ""),
      monthlyPassengers: String(data.get("monthlyPassengers") || ""),
      annualTravelSpend: String(data.get("annualTravelSpend") || ""),
      primaryTravel: String(data.get("primaryTravel") || ""),
      businessPrograms: String(data.get("businessPrograms") || ""),
      businessProgramAirlines: String(data.get("businessProgramAirlines") || "").trim(),
      bookingMethod: String(data.get("bookingMethod") || ""),
      travelCard: String(data.get("travelCard") || ""),
      primaryAirlines: String(data.get("primaryAirlines") || "").trim(),
      goals,
      notes: String(data.get("notes") || "").trim(),
      requestedTier: selectedTier || "",
      consent: String(data.get("consent") || ""),
      website: String(data.get("website") || "")
    };

    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The request could not be submitted.");
      form.reset();
      showStatus("success", `Thank you. Your consultation request has been saved${result.reference ? ` as ${result.reference}` : ""}. You can now be contacted to schedule the free call.`);
    } catch (error) {
      const subject = encodeURIComponent(`Midnight Travel Consultation — ${payload.company}`);
      const body = encodeURIComponent([
        `Name: ${payload.fullName}`,
        `Company: ${payload.company}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone || "Not provided"}`,
        `Monthly trips: ${payload.monthlyTrips}`,
        `Monthly passengers: ${payload.monthlyPassengers}`,
        `Annual travel spend: ${payload.annualTravelSpend}`,
        `Airline business programs: ${payload.businessPrograms}`,
        `Airlines/programs: ${payload.businessProgramAirlines || "Not provided"}`,
        `Booking method: ${payload.bookingMethod}`,
        `Travel card: ${payload.travelCard}`,
        `Goals: ${payload.goals.join(", ") || "Not provided"}`,
        `Notes: ${payload.notes || "Not provided"}`
      ].join("\n"));
      showStatus("error", "The database connection is not active yet. Your entries are still in the form. After you configure Cloudflare D1, submissions will save automatically. A mail fallback can also be enabled by replacing the placeholder email in assets/consultation.js.");
      console.error(error);
      // Optional fallback after adding a real email address:
      // window.location.href = `mailto:hello@midnighttravelconsulting.com?subject=${subject}&body=${body}`;
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Request a Free Consultation <span>↗</span>';
    }
  });
})();
