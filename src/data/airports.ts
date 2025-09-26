export type Airport = {
  code: string;               
  city: string;
  state?: string;
  country: string;
  airport: string;            
  popular?: boolean;
};

export const AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi", state: "Delhi", country: "India", airport: "Indira Gandhi International Airport", popular: true },
  { code: "BOM", city: "Mumbai", state: "Maharashtra", country: "India", airport: "Chhatrapati Shivaji Maharaj International Airport", popular: true },
  { code: "HYD", city: "Hyderabad", state: "Telangana", country: "India", airport: "Rajiv Gandhi International Airport", popular: true },
  { code: "BLR", city: "Bengaluru", state: "Karnataka", country: "India", airport: "Kempegowda International Airport", popular: true },
  { code: "MAA", city: "Chennai", state: "Tamil Nadu", country: "India", airport: "Chennai International Airport", popular: true },
  { code: "GOI", city: "Goa", state: "Goa", country: "India", airport: "Manohar International Airport" },
  { code: "PNQ", city: "Pune", state: "Maharashtra", country: "India", airport: "Pune International Airport" },
  { code: "AMD", city: "Ahmedabad", state: "Gujarat", country: "India", airport: "Sardar Vallabhbhai Patel International Airport" },
  { code: "CCU", city: "Kolkata", state: "West Bengal", country: "India", airport: "Netaji Subhas Chandra Bose International Airport" },
  { code: "JAI", city: "Jaipur", state: "Rajasthan", country: "India", airport: "Jaipur International Airport" },
];
