import { spouseChildren, islamic } from './engine'

export const lawsByCountry = {
  lk: ['lk-general', 'lk-kandyan', 'lk-thesawalamai', 'lk-muslim', 'lk-unsure'],
  pk: ['pk-sunni', 'pk-shia', 'pk-christian', 'pk-other', 'pk-unsure'],
}

// form: which questions to ask (null = explain only, no calculation)
// reviewed: set to true ONLY after a lawyer has confirmed the rules
export const laws = {
  'lk-general': {
    form: 'spouseChildren',
    run: (i) => spouseChildren(i, { spouseShare: [1, 2] }),
    basis: 'Matrimonial Rights and Inheritance Ordinance, sections 22 to 24',
    reviewed: false,
  },
  'lk-kandyan': {
    form: null,
    basis: 'Kandyan Law Declaration and Amendment Ordinance',
    reviewed: false,
  },
  'lk-thesawalamai': {
    form: null,
    basis: 'Matrimonial Rights and Inheritance (Jaffna) Ordinance',
    reviewed: false,
  },
  'lk-muslim': {
    form: 'islamic',
    run: islamic,
    basis: 'Muslim Intestate Succession Ordinance (No. 10 of 1931)',
    reviewed: false,
  },
  'lk-unsure': { form: null, reviewed: false },
  'pk-sunni': {
    form: 'islamic',
    run: islamic,
    basis: 'Muslim Personal Law (Shariat) Application Act 1962; Muslim Family Laws Ordinance 1961',
    reviewed: false,
  },
  'pk-shia': { form: null, reviewed: false },
  'pk-christian': {
    form: 'spouseChildren',
    run: (i) => spouseChildren(i, { spouseShare: [1, 3] }),
    basis: 'Succession Act 1925, section 33',
    reviewed: false,
  },
  'pk-other': { form: null, reviewed: false },
  'pk-unsure': { form: null, reviewed: false },
}