import { FlightRow, FlightFare } from "../data/flights";
import { Row, FareOption, Segment } from "../components/flightlist/OnewayResultList";

/* ===== Fare adapter ===== */
export function adaptFare(f: FlightFare): FareOption {
  return {
    code: f.fareId,
    label: f.brand,
    price: f.totalINR,
    refundable: f.refundable ? "Refundable" : "Non-Refundable",
    cabin: f.cabin,
    meal: f.meal ? "Meal included" : undefined,
    baggage: {
      handKg: f.cabinBagKg,
      checkKg: f.baggageKg,
    },
    seat: f.seatSelect ? "Free seat" : "Paid seat",

    agentFareINR: f.agentNetINR,
    commissionINR: f.agentCommissionINR,

    perks: [
      f.refundable ? "Refundable" : "No refund",
      f.seatSelect ? "Seat included" : "Paid seat",
      f.meal ? "Meal" : "",
    ].filter(Boolean),
  };
}

/* ===== Row adapter ===== */
export function adaptFlightRow(r: FlightRow): Row {
  const fares = r.fares.map(adaptFare);

  return {
    id: r.id,
    airline: r.airline,
    logo: r.logo,
    flightNos: r.flightNos,

    fromCity: r.fromCity,
    fromIata: r.fromIata,
    toCity: r.toCity,
    toIata: r.toIata,

    departTime: r.departTime,
    departDate: r.departDate,
    arriveTime: r.arriveTime,
    arriveDate: r.arriveDate,

    stops: r.stops,
    stopLabel: r.stopLabel,
    durationMin: r.durationMin,

    refundable: r.refundable,
    extras: r.extras ?? [],

    fares,
    totalFareINR: Math.min(...fares.map(f => f.price)),

    /* row-level fallback */
    agentFareUSD: fares[0]?.agentFareINR ?? 0,
    commissionUSD: fares[0]?.commissionINR ?? 0,

    /* TEMP segments (until API provides real segments) */
    segments: [
      {
        fromCity: r.fromCity,
        fromIata: r.fromIata,
        departTime: r.departTime,
        departDate: r.departDate,
        toCity: r.toCity,
        toIata: r.toIata,
        arriveTime: r.arriveTime,
        arriveDate: r.arriveDate,
        carrier: r.airline,
        flightNo: r.flightNos,
        durationMin: r.durationMin,
        beverage: true,
        seatType: "Standard",
        legroomInch: 30,
      },
    ],

    baggage: {
      handKg: fares[0]?.baggage?.handKg,
      checkKg: fares[0]?.baggage?.checkKg,
      piece: "1 PC",
    },

    cancellation: {
      refund: [],
      change: [],
    },
  };
}
