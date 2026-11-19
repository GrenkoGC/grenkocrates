// crates.js

const CRATES = {
  crate1: {
    name: 'Season Crate 1',
    img: 'https://yourimageshare.com/ib/cwwrwslAaB.png',
    currency: '$',
    cost: 100,
    pool: [
      { name: 'GrenkBot-A1', chance: 53.35 },
      { name: 'GrenkTurret-A1', chance: 20.0 },
      { name: 'Gronke', chance: 15.0 },
      { name: 'GrenkerDroid', chance: 10.0 },
      { name: 'The ElderGrenk', chance: 1.0 },
      { name: 'Grenko', chance: 0.5 },
      { name: 'Paradoxed Grenko', chance: 0.1 },
      { name: 'THE_PC2408', chance: 0.05 }
    ]
  },
  
  crate2: {
    name: 'Gem Crate 1',
    img: 'https://yourimageshare.com/ib/fKPwU3NRf6.png',
    currency: '💎',
    cost: 50,
    pool: [
      { name: 'Gem GrenkTurret-A3', chance: 88.95 },
      { name: 'Gem The ElderGrenk', chance: 10 },
      { name: 'Gem Lord Grenko', chance: 1 },
      { name: 'THE_PC2408', chance: 0.05 }
    ]
  }, // <-- ТУТ БЫЛА ПРОПУЩЕНА ЗАПЯТАЯ И ЗАКРЫВАЮЩАЯ СКОБКА
  
  crate3: {
    name: 'Chaos Crate',
    img: 'https://yourimageshare.com/ib/no9cnHZFNd.png',
    currency: '$',
    cost: 1000,
    pool: [
      { name: 'Bleng', chance: 99.0 },
      { name: 'Olado', chance: 1.0 },
    ]
  }
};
