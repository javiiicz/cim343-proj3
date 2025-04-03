export default function NavTab (props) {
    var func = props.func ? props.func : nothing;

    return(
        <div onClick={func} className='cursor-pointer hover:font-semibold transition-all'>{props.name}</div>
    )
}

const nothing = () => {}