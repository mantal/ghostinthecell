let factories = Array.from(new Array(parseInt(readline()))).map((_, i) => { return {
	id: i,
    links: [],
	owner: 0,
	garrison: 0,
	production: 0
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
			if (factory.garrison > tf.garrison) {
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
		}
    }

    let move = factories.filter(e => e.owner === 1).map(getMove);
    if (move.length === 0)
    	move = false;
    else {
		move = move.reduce((max, e) => {
			if (!max)
				return e;
			return compare(max.to, e.to) > 0 ? max : e;
		});
	}

	if (!move.to)
		print('WAIT');
	else
		print(`MOVE ${move.from.id} ${move.to.id} ${move.to.garrison + 1}`);
}