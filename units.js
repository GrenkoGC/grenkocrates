// units.js

const ALL_UNITS = [
  {
    name: 'GrenkBot-A1',
    r: 'common',
    price: 50,
    img: 'https://yourimageshare.com/ib/zwYuDDfH8D.jpg',
    stats: {
      Type: 'Single',
      Damage: '15 - 35',
      Range: '10 - 13',
      Cooldown: '1.75 - 0.5',
      Limit: '5'
    }
  },
  {
    name: 'GrenkTurret-A1',
    r: 'rare',
    price: 150,
    img: 'https://yourimageshare.com/ib/4Qf4kNjKEl.jpg',
    stats: {
      Type: 'Splash',
      Damage: '45 - 125',
      Range: '13 - 15',
      Cooldown: '2 - 1',
      Limit: '3'
    }
  },
  {
    name: 'Gronke',
    r: 'epic',
    price: 400,
    img: 'https://yourimageshare.com/ib/u4qJyiSjUY.jpg',
    stats: {
      Type: 'Stun',
      Damage: '125 - 425',
      Range: '16 - 20',
      Cooldown: '5 - 3',
      'Stun Time': '0.3',
      Limit: '2'
    }
  },
  {
    name: 'GrenkerDroid',
    r: 'legendary',
    price: 900,
    img: 'https://yourimageshare.com/ib/fxvI30kSzR.jpg',
    stats: {
      Type: 'Support',
      'Damage Boost': '15% - 22%',
      Range: '13 - 14.75',
      Limit: '3'
    }
  },
  {
    name: 'The ElderGrenk',
    r: 'mythic',
    price: 1800,
    img: 'https://yourimageshare.com/ib/yScfKp7Eir.jpg',
    stats: {
      Type: 'Double',
      Damage: '95 - 240',
      Range: '12 - 15',
      Cooldown: '2.5 - 0.4',
      Limit: '3'
    }
  },
  {
    name: 'Grenko',
    r: 'leader',
    price: 3500,
    img: 'https://yourimageshare.com/ib/iCcdyCqr3N.jpg',
    secret: true,
    stats: {
      Type: 'Spawner + Pierce',
      Damage: '150 - 430',
      Range: '11 - 14',
      Cooldown: '3 - 2',
      'Spawn Cooldown': '30 - 25',
      'Ally HP': '450 - 1000',
      'Ally DPS': '0 - 275',
      Limit: '1'
    }
  },
  {
    name: 'Paradoxed Grenko',
    r: 'secret',
    price: 7500,
    img: 'https://yourimageshare.com/ib/qqH26h3kBO.jpg',
    secret: true,
    stats: {
      Type: 'Knockback',
      Damage: '500 - 1450',
      Range: '13.5 - 15',
      Cooldown: '2 - 0.75',
      'Knockback Strength': '1 Studs - 2.25 Studs',
      Limit: '2'
    }
  },
  {
    name: 'Gem GrenkTurret-A3',
    r: 'exclusive',
    price: 500,
    img: 'https://yourimageshare.com/ib/uEaf0uwYY6.jpg',
    stats: {
      Type: 'Slow',
      Damage: '300 - 550',
      Range: '14 - 16',
      Cooldown: '3 - 1.5',
      Limit: '3'
    }
  },
  {
    name: 'Gem The ElderGrenk',
    r: 'exclusive',
    price: 1200,
    img: 'https://yourimageshare.com/ib/98RnJ4wA8h.jpg',
    stats: {
      Type: 'Stun + Double',
      Damage: '600 - 1300',
      Range: '12 - 13.5',
      Cooldown: '4 - 2.25',
      'Stun Time': '0.35',
      Limit: '3'
    }
  },
  {
    name: 'Gem Lord Grenko',
    r: 'exclusive',
    price: 2500,
    img: 'https://yourimageshare.com/ib/RNK5BcpZQ2.jpg',
    secret: true,
    stats: {
      Type: 'Slow + Stun + Spawner',
      Damage: '650 - 2250',
      Range: '14.5 - 20',
      Cooldown: '3 - 1.25',
      'Ally HP': '600 - 1250',
      'Ally DPS': '200 - 550',
      'Spawn Cooldown': '25 - 20',
      'Stun Time': '0.4',
      Limit: '1'
    }
  },
  {
    name: 'Eggren',
    r: 'exclusive',
    price: 500,
    img: 'https://yourimageshare.com/ib/Ayx5zw3U54.jpg',
    stats: {
      Type: 'Critical Stun',
      Damage: '330 - 880',
      Range: '12.5 - 16',
      Cooldown: '3 - 2.25',
      'Critical Stun Chance': '25%',
      'Critical Stun Damage Multiplier': 'x1.5 - x3',
      'Critical Stun Time': '0.35 - 0.5',
      Limit: '2'
    }
  },
  {
    name: 'THE_PC2408',
    r: 'ultimate',
    price: 25000,
    img: 'https://yourimageshare.com/ib/whszmltza8.jpg',
    secret: true,
    stats: {
      Type: 'Cheating',
      Damage: '4750 - 15500',
      Range: '14 - 22',
      Cooldown: '3 - 1.25',
      Limit: '1',
      'Cheating': 'Switches attack type every 90 seconds (Including Slowing, Critical, Stun and Nerf)',
      'Slowing': '55%',
      'Critical Damage Multiplier': 'x5',
      'Critical Stun Time': '1.5',
      'Critical Damage Chance': '10%',
      'Critical Stun Chance': '5%',
      'All Stats Nerf': '50%'
    }
  },
    {
    name: 'Bleng',
    r: 'mythic',
    price: 1800,
    img: 'https://yourimageshare.com/ib/JksGwoJ6lE.jpg',
    stats: {
      Type: 'Tag',
      Damage: '325 - 775',
      Range: '10 - 13.25',
      Cooldown: '8 - 6.5',
      'Tag Time': '3.25 - 4',
      'Tag': 'When attacked an enemy, tagging him and all units on map deals for that enemy 2x damage'
    }
  },
  {
    name: 'Olado',
    r: 'secret',
    price: 7500,
    img: 'https://yourimageshare.com/ib/wjoQsPo4i5.jpg',
    stats: {
      Type: 'Parry Slow',
      Damage: '835 - 1750',
      Range: '13 - 15.25',
      Cooldown: '4 - 2.75',
      'Parry Slow': '35%',
      'Parry Slow Time': '0.5 - 1.6',
      'Parry': 'Counter an enemy attack and mirrors the damage with 2x boost'
    }
  }
];
