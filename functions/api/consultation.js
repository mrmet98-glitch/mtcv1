const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return json({ error: "Expected JSON." }, 415);
    }

    const contentLength = Number(context.request.headers.get("content-length") || 0);
    if (contentLength > 25000) return json({ error: "Request is too large." }, 413);

    const body = await context.request.json();

    // Honeypot: silently accept obvious bot submissions without storing them.
    if (clean(body.website, 120)) {
      return json({ ok: true });
    }

    const record = {
      fullName: clean(body.fullName, 120),
      company: clean(body.company, 160),
      email: clean(body.email, 180).toLowerCase(),
      phone: clean(body.phone, 60),
      role: clean(body.role, 120),
      monthlyTrips: clean(body.monthlyTrips, 80),
      monthlyPassengers: clean(body.monthlyPassengers, 80),
      annualTravelSpend: clean(body.annualTravelSpend, 80),
      primaryTravel: clean(body.primaryTravel, 100),
      businessPrograms: clean(body.businessPrograms, 40),
      businessProgramAirlines: clean(body.businessProgramAirlines, 500),
      bookingMethod: clean(body.bookingMethod, 120),
      travelCard: clean(body.travelCard, 80),
      primaryAirlines: clean(body.primaryAirlines, 500),
      goals: Array.isArray(body.goals) ? body.goals.map((goal) => clean(goal, 100)).slice(0, 12) : [],
      notes: clean(body.notes, 4000),
      requestedTier: clean(body.requestedTier, 40),
      consent: clean(body.consent, 10),
      userAgent: clean(context.request.headers.get("user-agent"), 500)
    };

    if (!record.fullName || !record.company || !record.email || !record.monthlyTrips || !record.monthlyPassengers || !record.annualTravelSpend || !record.businessPrograms || !record.bookingMethod || !record.travelCard || record.consent !== "Yes") {
      return json({ error: "Please complete all required fields." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    if (!context.env.DB) {
      return json({ error: "Consultation storage is not configured." }, 503);
    }

    const reference = `MTC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    await context.env.DB.prepare(`
      INSERT INTO consultation_requests (
        reference, full_name, company, email, phone, role,
        monthly_trips, monthly_passengers, annual_travel_spend, primary_travel,
        business_programs, business_program_airlines, booking_method, travel_card,
        primary_airlines, goals, notes, requested_tier, consent, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      reference,
      record.fullName,
      record.company,
      record.email,
      record.phone,
      record.role,
      record.monthlyTrips,
      record.monthlyPassengers,
      record.annualTravelSpend,
      record.primaryTravel,
      record.businessPrograms,
      record.businessProgramAirlines,
      record.bookingMethod,
      record.travelCard,
      record.primaryAirlines,
      JSON.stringify(record.goals),
      record.notes,
      record.requestedTier,
      record.consent,
      record.userAgent
    ).run();

    return json({ ok: true, reference }, 201);
  } catch (error) {
    console.error("Consultation form error", error);
    return json({ error: "Unable to save the consultation request." }, 500);
  }
}

export function onRequestGet() {
  return json({ error: "Method not allowed." }, 405);
}
