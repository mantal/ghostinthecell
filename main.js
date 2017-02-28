let factories = Array.from(new Array(parseInt(readline()))).map((_, i) => { return {
	id: i,
    links: [],
	owner: 0,
	garrison: 0,
	production: 0,
	incomingAllies: 0,
	incomingEnemies: 0
} });

let linkCount = parseInt(readline());
for (let i = 0; i < linkCount; i++) {
    let inputs = readline().split(' ');
    let factory1 = parseInt(inputs[0]);
    let factory2 = parseInt(inputs[1]);
    let distance = parseInt(inputs[2]);
    factories[factory1].links.push({ to: factory2, distance: distance });
    factories[factory2].links.push({ to: factory1, distance: distance });
}

function compare(fa, fb) {
	if (!fa)
		return -1;
	if (!fb)
		return 1;
	if (fa.owner === 1)
		return -1;
	if (fb.owner === 1)
		return 1;
	if (fa.garrison == fb.garrison) {
		if (fa.owner <= fb.owner)
			return 1;
		return fa.production >= fb.production;
	}
	return fa.garrison <= fb.garrison ? 1 : -1;
}

function getExpectedEnemies(factory) {
	return factory.garrison + factory.incomingEnemies + 1;
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
		.filter(l => factories[l.to].owner === -1 && getAttackValue(factory, factories[l.to]) > 0)
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
		}
		else if (entityType === 'TROOP') {
        	if (arg1 == 1)
				factories[arg3].incomingAllies += arg4;
        	else
				factories[arg3].incomingEnemies += arg4;
		}
    }

    let move = factories.filter(e => e.owner === 1).map(getMove).map(moves => {
    	return moves.map(m => {
			if (m.from.garrison < m.quantity)
				return '';
			m.from.garrison -= m.quantity;
			return `MOVE ${m.from.id} ${m.to.id} ${m.to.garrison + 1}`;
		}).filter(s => s.length > 0).join(';');
	}).filter(s => s.length > 0).join(';');

	if (move.trim().length === 0)
		print('WAIT');
	else
		print(move);
}