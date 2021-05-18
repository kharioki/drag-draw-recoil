import { useRef, memo } from 'react';
import Draggable from 'react-draggable';
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';
import mem from 'mem';
import { randomBetween } from './utils';

const boxIdsState = atom({
    key: 'boxIdsState',
    default: [],
});

const getBoxState = mem((id) => atom({
    key: `boxState${id}`,
    default: {
        x: randomBetween(0, window.innerWidth - 100), 
        y: randomBetween(1, window.innerHeight - 100)
    }
}));

export default function WithRecoil() {
    return (
        <RecoilRoot>
            <Create />
            <Boxes />
            <BigNumber />
            <BoundingBox />
        </RecoilRoot>
    );
};

const boundingState = selector({
    key: 'boundingState',
    get: ({ get }) => {
        const boxIds = get(boxIdsState);
        const boxes = boxIds.map((id) =>  get(getBoxState(id)))
        // console.log({boxes});

        const bounding = boxes.reduce((acc, box) => {
            if (acc.minX === null || box.x < acc.minX) acc.minX = box.x;
            if (acc.minY === null || box.y < acc.minY) acc.minY = box.y;
            if (acc.maxX === null || box.x > acc.maxX) acc.maxX = box.x;
            if (acc.maxY === null || box.y > acc.maxY) acc.maxY = box.y;

            return acc;
        }, {
            minX: null,
            minY: null,
            maxX: null,
            maxY: null,
        })

        return bounding;
    }
});

function BoundingBox() {
    const bounding = useRecoilValue(boundingState);

    if (bounding.minX === null) return null;

    // console.log(bounding);
    return <div 
    className="bounding-box"
    style={{
        top: bounding.minY,
        left: bounding.minX,
        width: bounding.maxX - bounding.minX + 96,
        height: bounding.maxY - bounding.minY + 96,
    }} />
}

const totalsState = selector({
    key: 'totalState',
    get: ({ get }) => {
        const boxIds = get(boxIdsState);
        return boxIds.length;
    }
});

function BigNumber() {
    const total = useRecoilValue(totalsState);
    return <div className="big-number">{total}</div>
}

function Create() {
    const [boxIds, setBoxIds] = useRecoilState(boxIdsState);

    return <button className='add' onClick={() => {
        const id = new Date().toISOString();
        setBoxIds([...boxIds, id]);
    }}>Add</button>;
}

const DrawBox = memo(({ id }) => {
    const [box, setBox] = useRecoilState(getBoxState(id));
    const ref = useRef();

    return(
        <Draggable 
            nodeRef={ref} 
            position={{ x: box.x, y: box.y }}
            onDrag={(e, data) => {
                setBox({ ...box, x: data.x, y: data.y });
                // console.log({ x: data.x, y: data.y });
            }}
        >
            <div ref={ref} className="box">box</div>
        </Draggable>
    );
});


function Boxes() {
    const boxIds = useRecoilValue(boxIdsState);

    return (
        <>
            {boxIds.map(id => <DrawBox key={id} id={id} />)}
        </>
    );
}

