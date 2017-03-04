let factories = Array.from(new Array(parseInt(readline()))).map((_, i) => { return {
	id: i,
    links: [],
	owner: 0,
	garrison: 0,
	production: 0,
	incomingAllies: 0,
	incomingEnemies: 0,
	incomingBombs: [],
} });

let time = 0;

{
	let linkCount = parseInt(readline());
	for (let i = 0; i < linkCount; i++) {
		let inputs = readline().split(' ');
		let factory1 = parseInt(inputs[0]);
		let factory2 = parseInt(inputs[1]);
		let distance = parseInt(inputs[2]);
		factories[factory1].links.push({ to: factory2, distance: distance });
		factories[factory2].links.push({ to: factory1, distance: distance });
	}
}

function getBombAction() {
	let enemies = factories.filter(f => f.owner === -1 && (f.garrison > 0 || f.incomingEnemies === 0) && f.incomingAllies === 0 && f.incomingBombs.length === 0);
	if (enemies.length === 0)
		return '';

	let target = enemies.sort((a, b) => a.production > b.production ? 1 : -1)[0];

	let alliesInRange = target.links.filter(f => f.owner === 1);

	let source;
	if (alliesInRange.length === 0) {
		source = factories.filter(f => f.owner === 1)[0];
	}
	else {
		source = factories[alliesInRange.sort((a, b) => a.distance > b.distance ? -1 : 1)[0].to];
	}
	printErr(JSON.stringify(source));

	return 'BOMB ' + source.id + ' ' + target.id;
}

function compare(fa, fb) {
	if (fa.owner === 1)
		return -1;
	if (fb.owner === 1)
		return 1;
	return getFactoryValue(fa) > getFactoryValue(fb) ? 1 : -1;
}

function getExpectedEnemies(factory) {
	return factory.garrison + factory.incomingEnemies + 1;
}

function getFactoryValue(factory) {
	if (factory.production === 0 && getExpectedEnemies(factory))
		return -9999;//
	return factory.production - getExpectedEnemies(factory);

}

function getAttackValue(source, target) {
	let expectedBalance = target.incomingAllies - getExpectedEnemies(target);
	if (expectedBalance > 0)
		return 0;
	if (source.garrison + expectedBalance > 0)
		return 1;
	return -1;
}

function getMove(factory) {
	return factory.links
		.filter(l => factories[l.to].owner <= 0 && getAttackValue(factory, factories[l.to]) > 0)
		.map(l => factories[l.to])
		.sort(compare)
		.map(f => { return {
			from: factory,
			to: f,
			quantity: getExpectedEnemies(f)
		}; });
}

while (true) {
    let entityCount = parseInt(readline());
    for (let i = 0; i < entityCount; i++) {
        let inputs = readline().split(' ');
        let id = parseInt(inputs[0]);
        let entityType = inputs[1];
        let arg1 = parseInt(inputs[2]);
        let arg2 = parseInt(inputs[3]);
        let arg3 = parseInt(inputs[4]);
        let arg4 = parseInt(inputs[5]);
        let arg5 = parseInt(inputs[6]);

        if (entityType === "FACTORY") {
			factories[id].owner = arg1;
			factories[id].garrison = arg2;
			factories[id].production = arg3;
			factories[id].incomingAllies = 0;
			factories[id].incomingEnemies = 0;
			factories[id].incomingBombs = [];
		}
		else if (entityType === 'TROOP') {
        	if (arg1 == 1)
				factories[arg3].incomingAllies += arg4;
        	else
				factories[arg3].incomingEnemies += arg4;
		} else if (entityType === 'BOMB') {
        	factories[arg2].incomingBombs.push({
				owner: arg1,
				to: arg3,
				countdown: arg4
			});
		}
    }

	let allyProd = factories.filter(e => e.owner === 1).length > 0 ? factories.filter(e => e.owner === 1).reduce((prod, e) => prod + e.production, 0) : 0;
	let enemyProd = factories.filter(e => e.owner === -1).length > 0 ?  factories.filter(e => e.owner === -1).reduce((prod, e) => prod + e.production, 0) : 0;

    let move = factories.filter(e => e.owner === 1).map(getMove).map(moves => {
    	return moves.map(m => {
			if (m.from.garrison < m.quantity)
				return '';
			m.from.garrison -= m.quantity;
			return `MOVE ${m.from.id} ${m.to.id} ${m.to.garrison + 1}`;
		}).filter(s => s.length > 0).join(';');
	}).filter(s => s.length > 0).join(';');

    let action = '';

	if (move.trim().length === 0)
		action = 'WAIT';
	else
		action = move;

	let bomb = getBombAction();
	print(action + (bomb.length > 0 ? ';' + bomb : '') + ';MSG ' + allyProd + '/' + enemyProd);

	time++;
}