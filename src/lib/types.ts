/**
 * Datamodell enligt kravspecifikation v1 §5.
 *
 * AnswerSet är formulärets enda sanning. Den skickas rå till lagvalsmotorn
 * (src/lib/legal/regime.ts) och vidare till klausulmotorn. Inga React-beroenden
 * får finnas i den här filen — den ska kunna köras i Node för test.
 */

/* ---------------------------------------------------------------- 5.1 */

export type PropertyType =
  | "apartment" // lägenhet
  | "house" // villa/radhus
  | "room_in_own_home" // rum i bostad uthyraren själv bor i
  | "holiday_home"; // fritidshus

export type LandlordTitle =
  | "owner_freehold" // äger fastigheten (villa, ägarlägenhet)
  | "condominium" // bostadsrätt
  | "first_hand_lease" // uthyraren har själv hyresrätt -> andrahandsupplåtelse
  | "second_hand"; // uthyraren hyr själv i andra hand -> tredjehand

export type Purpose = "permanent" | "leisure";

export type PrivateRentalOrdinal = "first" | "additional";

/* ---------------------------------------------------------------- 5.2 */

export type ConsentStatus = "yes" | "no" | "applied";

/* ---------------------------------------------------------------- 5.3 */

export interface Address {
  street: string;
  postalCode: string;
  city: string;
}

export interface Tenant {
  name: string;
  idNumber: string;
  email: string;
  phone: string;
  currentAddress: Address;
}

export const MAX_TENANTS = 6;

/* ---------------------------------------------------------------- 5.4 */

export type Furnished = "none" | "partial" | "full";

/* ---------------------------------------------------------------- 5.5 */

export type CostMode =
  | "included" // ingår i hyran
  | "separate_actual" // betalas separat efter faktisk förbrukning
  | "separate_fixed" // betalas separat med fast belopp
  | "tenant_own_contract"; // hyresgästen tecknar eget abonnemang

export interface CostItem {
  mode: CostMode;
  amount?: number; // krävs när mode === 'separate_fixed'
}

export interface OtherCostItem extends CostItem {
  label: string;
}

export type PaymentDueRule =
  | "last_weekday_of_prior_month"
  | "first_of_month"
  | "custom";

export type PaymentMethod = "bankgiro" | "plusgiro" | "bank_account" | "swish";

export type LateInterest = "statutory" | "none";

export type RentAdjustment = "none" | "annual_negotiation" | "index";

/* ---------------------------------------------------------------- 5.6 */

export type ContractType = "indefinite" | "fixed";

export type FixedTermRenewal = "ends" | "auto_renew_same" | "auto_renew_indefinite";

/* ---------------------------------------------------------------- 5.7 */

export type DepositDeduction =
  | "unpaid_rent"
  | "damage_beyond_wear"
  | "cleaning"
  | "missing_keys";

/* ---------------------------------------------------------------- 5.8 */

export interface InventoryItem {
  item: string;
  quantity: number;
  condition: string;
}

export interface KeyItem {
  type: string;
  quantity: number;
}

/* ---------------------------------------------------------------- 5.9 */

export type PetsPolicy = "yes" | "no" | "by_agreement";

export type MaintenanceResponsibility = "landlord_all" | "standard_split";

/* ---------------------------------------------------------------- AnswerSet */

export interface AnswerSet {
  /* 5.1 Grunduppgifter */
  propertyType: PropertyType | "";
  landlordTitle: LandlordTitle | "";
  landlordIsBusiness: boolean | null;
  purpose: Purpose | "";
  privateRentalOrdinal: PrivateRentalOrdinal | "";

  /* 5.2 Samtycke och tillstånd */
  boardConsentObtained: ConsentStatus | "";
  boardConsentDate: string;
  boardConsentRef: string;
  landlordConsentObtained: ConsentStatus | "";
  rentTribunalPermit: string;

  /* 5.3 Parterna */
  landlordName: string;
  landlordIdNumber: string;
  landlordAddress: Address;
  landlordEmail: string;
  landlordPhone: string;
  tenants: Tenant[];

  /* 5.4 Hyresobjektet */
  objectAddress: Address;
  apartmentNumber: string;
  propertyDesignation: string;
  rooms: number | null;
  areaSqm: number | null;
  floor: string;
  hasBalcony: boolean;
  hasStorage: boolean;
  hasParking: boolean;
  parkingDetails: string;
  furnished: Furnished | "";
  sharedAreas: string;
  objectDescription: string;

  /* 5.5 Hyra och kostnader */
  baseRent: number | null;
  furnishingSurcharge: number | null;
  parkingFee: number | null;
  paymentDueRule: PaymentDueRule | "";
  paymentDueCustom: string;
  paymentMethod: PaymentMethod | "";
  paymentReference: string;
  lateInterest: LateInterest | "";
  rentAdjustment: RentAdjustment | "";
  rentAdjustmentIndex: string;

  costHeating: CostItem;
  costWater: CostItem;
  costElectricity: CostItem;
  costBroadband: CostItem;
  costTv: CostItem;
  costLaundry: CostItem;
  costWaste: CostItem;
  costOther: OtherCostItem[];

  /* 5.6 Avtalstid */
  contractType: ContractType | "";
  startDate: string;
  endDate: string;
  fixedTermRenewal: FixedTermRenewal | "";
  noticeExtendedTenant: number | null;

  /* 5.7 Deposition och säkerhet */
  depositAmount: number | null;
  depositReturnDays: number | null;
  depositDeductions: DepositDeduction[];
  prepaidRentMonths: number | null;

  /* 5.8 Skick, inventarier och nycklar */
  inspectionOnMoveIn: boolean;
  inspectionOnMoveOut: boolean;
  inventoryItems: InventoryItem[];
  keys: KeyItem[];
  keyReplacementCost: number | null;
  existingDamage: string;

  /* 5.9 Nyttjande och ordningsregler */
  maxOccupants: number | null;
  smokingAllowed: boolean | null;
  petsAllowed: PetsPolicy | "";
  sublettingAllowed: boolean | null;
  quietHours: string;
  tenantInsuranceRequired: boolean | null;
  maintenanceResponsibility: MaintenanceResponsibility | "";
  tenantReportingDuty: boolean;
  landlordAccessNotice: number | null;
  houseRulesAttached: boolean;

  /* 5.10 Signering */
  signingPlace: string;
  signingDate: string;
  copies: number | null;
  acknowledgeDraft: boolean;

  /* Bekräftelser (4.4, 9) */
  acknowledgeConsentRisk: boolean;
  acknowledgeTenureWaiver: boolean;
}

export function emptyAddress(): Address {
  return { street: "", postalCode: "", city: "" };
}

export function emptyTenant(): Tenant {
  return {
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    currentAddress: emptyAddress(),
  };
}

function cost(mode: CostMode = "included"): CostItem {
  return { mode };
}

export function createEmptyAnswerSet(): AnswerSet {
  return {
    propertyType: "",
    landlordTitle: "",
    landlordIsBusiness: null,
    purpose: "",
    privateRentalOrdinal: "",

    boardConsentObtained: "",
    boardConsentDate: "",
    boardConsentRef: "",
    landlordConsentObtained: "",
    rentTribunalPermit: "",

    landlordName: "",
    landlordIdNumber: "",
    landlordAddress: emptyAddress(),
    landlordEmail: "",
    landlordPhone: "",
    tenants: [emptyTenant()],

    objectAddress: emptyAddress(),
    apartmentNumber: "",
    propertyDesignation: "",
    rooms: null,
    areaSqm: null,
    floor: "",
    hasBalcony: false,
    hasStorage: false,
    hasParking: false,
    parkingDetails: "",
    furnished: "",
    sharedAreas: "",
    objectDescription: "",

    baseRent: null,
    furnishingSurcharge: null,
    parkingFee: null,
    paymentDueRule: "last_weekday_of_prior_month",
    paymentDueCustom: "",
    paymentMethod: "",
    paymentReference: "",
    lateInterest: "statutory",
    rentAdjustment: "none",
    rentAdjustmentIndex: "",

    costHeating: cost(),
    costWater: cost(),
    costElectricity: cost("tenant_own_contract"),
    costBroadband: cost("tenant_own_contract"),
    costTv: cost("tenant_own_contract"),
    costLaundry: cost(),
    costWaste: cost(),
    costOther: [],

    contractType: "indefinite",
    startDate: "",
    endDate: "",
    fixedTermRenewal: "",
    noticeExtendedTenant: null,

    depositAmount: null,
    depositReturnDays: 30,
    depositDeductions: ["unpaid_rent", "damage_beyond_wear"],
    prepaidRentMonths: null,

    inspectionOnMoveIn: true,
    inspectionOnMoveOut: true,
    inventoryItems: [],
    keys: [],
    keyReplacementCost: null,
    existingDamage: "",

    maxOccupants: null,
    smokingAllowed: false,
    petsAllowed: "",
    sublettingAllowed: false,
    quietHours: "22.00-07.00",
    tenantInsuranceRequired: true,
    maintenanceResponsibility: "standard_split",
    tenantReportingDuty: true,
    landlordAccessNotice: 7,
    houseRulesAttached: false,

    signingPlace: "",
    signingDate: "",
    copies: null,
    acknowledgeDraft: false,

    acknowledgeConsentRisk: false,
    acknowledgeTenureWaiver: false,
  };
}

/** 5.5 — totalRent är beräknat, aldrig inmatat. */
export function totalRent(a: AnswerSet): number {
  return (
    (a.baseRent ?? 0) +
    (a.furnished !== "none" ? a.furnishingSurcharge ?? 0 : 0) +
    (a.hasParking ? a.parkingFee ?? 0 : 0)
  );
}
