function Armor(name, type, attributes){
	this.name = name;
	this.type = type;
	this.attributes = attributes;

	this.getReduction = function(weapon, damage){
		var reduction = this.type.reduction(weapon, damage);
		for(var i = 0; i < this.attributes.length; i++){
			reduction += this.attributes[i].reduction(weapon, damage);
		}
		return reduction;
	}

	this.getName = function(){
		var fullName;
		if(name.length > 0){
			fullName = name;
			fullName += ' (' + this.type.name + ' armor)';
		} else{
			fullName = this.type.name + ' armor';
		}
		if(this.attributes.length > 0){
			fullName += ':' + this.attributes[0].name;
		}
		for(var i = 1; i < this.attributes.length; i++){
			fullName += ', ' + this.attributes[i].name;
		}
		return fullName;
	}

	this.getWeight = function(){
		var fullWeight = this.type.weight;
		for(var i = 0; i < this.attributes.length; i++){
			fullWeight += ' ' + this.attributes[i].weight;
		}
		if(fullWeight <= 0){
			fullWeight = 1;
		}
		return fullWeight;
	}

	this.toString = function(){
		return this.getName();
		//todo more attributes
	}
}

const armorAttributes = [
	{
		name: 'woven',
		reduction: function(weapon, damage){return Math.floor(damage * .15)},
		weight: 5
	},
	{
		name: 'mirrored',
		reduction: function(weapon, damage){return weapon.type == WEAPON_LASER ? Math.floor(damage * .5) : Math.floor(-1 * (damage * .2))},
		weight: 20
	},
	{
		name: 'padded',
		reduction: function(weapon, damage){return weapon.type == WEAPON_KINETIC ? Math.floor(damage * .15) : Math.floor(damage * .1)},
		weight: 15
	},
	{
		name: 'absorbing',
		reduction: function(weapon, damage){
			if(weapon.type == WEAPON_LASER){
				var absorbtion = Math.floor(damage * .1);
				write('Your armor absorbed ' + absorption + ' damage from the blast, converting it into health.');
				player.health += absorption;
				return Math.floor(damage * .1);
			} else {
				return 0;
			}
		},
		weight: 15
	},
	{
		name: 'fiber',
		reduction: function(weapon, damage){
			return damage;
		},
		weight: -10
	},
	{
		name: 'crystal',
		reduction: function(weapon, damage){return weapon.type == TYPE_LASER ? Math.floor(-1 * damage * .1) : Math.floor(damage * .3)},
		weight: 20
	},
	{
		name: 'unreliable',
		reduction: function(weapon, damage){return Math.floor((Math.random() - .5) * damage)},
		weight: 0
	}
];

const armorTypes = [
	{
		name: 'light',
		reduction: function(weapon, damage){return Math.floor(Damage * .1)},
		weight: 5
	},
	{
		name: 'standard',
		reduction: function(weapon, damage){return Math.floor(damage * .2)},
		weight: 15
	},
	{
		name: 'heavy',
		reduction: function(weapon, damage){return Math.floor(damage * .3)},
		weight: 25
	},
	{
		name: 'extra heavy',
		reduction: function(weapon, damage){return Math.floor(damage * .4)},
		weight: 35
	},
	{
		name: 'exoskeleton',
		reduction: function(weapon, damage){return Math.floor(damage * .6)},
		weight: 100
	}
]

function createRandomArmor(){
	name = generateArmorName();
	type = armorTypes[Math.floor(Math.random() * armorTypes.length)];
	attributes = generateRandomArmorAttributes();
	return new Armor(name, type, attributes);
}

function generateRandomArmorAttributes(){
	var rand = Math.random();
	var attrs = new Array();
	rand -= .5;
	while(rand > 0){
		rand.push(armorAttributes[Math.floor(Math.random() * armorAttributes.length)]);
		rand -= .15;
	}
	return attrs;
}