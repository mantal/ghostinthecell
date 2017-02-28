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

function getMove(factory) {
    let target = false;

	factory.links.forEach(link => {
		let tf = factories[link.to];
		if (tf.owner === 1)
			return ;
		if (!target || compare(tf, target) > 0) {
			let expectedBalance = tf.incomingAllies - tf.garrison - tf.incomingEnemies;
			if (expectedBalance > 0)
				return ;
			if (factory.garrison + expectedBalance > 0) {
				target = tf;
			}
		}
	});
	return {
		from: factory,
		to: target
	};
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
		else {
        	if (arg1 == 1)
				factories[arg3].incomingAllies += arg4;
        	else
				factories[arg3].incomingEnemies += arg4;
		}
    }

    let move = factories.filter(e => e.owner === 1).map(getMove).map(m => {
    	if (!m.to)
    		return '';
    	return `MOVE ${m.from.id} ${m.to.id} ${m.to.garrison + 1}`;
	}).filter(s => s.length > 0).join(';');

	if (move.trim().length === 0)
		print('WAIT');
	else
		print(move);
}