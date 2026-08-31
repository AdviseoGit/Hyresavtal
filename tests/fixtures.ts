/** Testfixturer — motsvarar acceptansfallen T1-T10 i kravspecifikation v1 §13. */

import { createEmptyAnswerSet, type AnswerSet } from "../src/lib/types";

export function answers(overrides: Partial<AnswerSet> = {}): AnswerSet {
  return { ...createEmptyAnswerSet(), ...overrides };
}

/** Privat uthyrning av egen bostadsrätt, permanentboende, första upplåtelsen. */
export function base(overrides: Partial<AnswerSet> = {}): AnswerSet {
  return answers({
    propertyType: "apartment",
    landlordTitle: "condominium",
    landlordEntity: "natural_person",
    purpose: "permanent",
    landlordRentsMoreThanTwo: false,
    boardConsentObtained: "yes",
    landlordName: "Anna Andersson",
    landlordIdNumber: "19850101-0014",
    landlordAddress: { street: "Storgatan 1", postalCode: "111 22", city: "Stockholm" },
    landlordEmail: "anna@example.com",
    landlordPhone: "+46701234567",
    tenants: [
      {
        name: "Bo Bengtsson",
        idNumber: "19900101-0009",
        email: "bo@example.com",
        phone: "+46709876543",
        currentAddress: { street: "Lillgatan 2", postalCode: "222 33", city: "Uppsala" },
      },
    ],
    objectAddress: { street: "Storgatan 1", postalCode: "111 22", city: "Stockholm" },
    apartmentNumber: "1101",
    rooms: 2,
    areaSqm: 56,
    furnished: "none",
    baseRent: 9000,
    paymentDueRule: "last_weekday_of_prior_month",
    paymentMethod: "bankgiro",
    paymentReference: "123-4567",
    lateInterest: "statutory",
    rentAdjustment: "none",
    contractType: "indefinite",
    startDate: "2030-01-01",
    keys: [{ type: "Lägenhetsnyckel", quantity: 2 }],
    maxOccupants: 2,
    petsAllowed: "by_agreement",
    signingPlace: "Stockholm",
    signingDate: "2029-12-01",
    acknowledgeDraft: true,
    ...overrides,
  });
}

export const T1 = base();

export const T2 = base({ landlordRentsMoreThanTwo: true });

export const T3 = base({
  landlordTitle: "first_hand_lease",
  boardConsentObtained: "",
  landlordConsentObtained: "yes",
});

export const T4 = base({
  propertyType: "house",
  landlordTitle: "owner_freehold",
  purpose: "leisure",
});

export const T5 = base({
  propertyType: "house",
  landlordTitle: "owner_freehold",
  landlordEntity: "legal_entity",
});

export const T6 = base({
  propertyType: "room_in_own_home",
  landlordTitle: "owner_freehold",
  rooms: 1,
  areaSqm: 18,
  furnished: "full",
  sharedAreas: "Kök, badrum och vardagsrum delas med uthyraren.",
});

/** JB12 (andrahand) med bestämd tid — hyrestidens längd styr uppsägningstiden. */
export function jbFixed(startDate: string, endDate: string): AnswerSet {
  return base({
    landlordTitle: "first_hand_lease",
    boardConsentObtained: "",
    landlordConsentObtained: "yes",
    contractType: "fixed",
    fixedTermRenewal: "ends",
    startDate,
    endDate,
  });
}

export const T7 = jbFixed("2030-01-01", "2030-03-01"); // 2 månader
export const T8 = jbFixed("2030-01-01", "2030-07-01"); // 6 månader
export const T9 = jbFixed("2030-01-01", "2031-01-01"); // 12 månader

export const T10 = base({
  contractType: "fixed",
  fixedTermRenewal: "ends",
  startDate: "2030-01-01",
  endDate: "2031-01-01",
});
