function NameInput ({ handleNameKeyDown }: any) {
    return (
        <div className='player-name-input'>
            <div>Enter your name</div>
            <input
                onKeyDown={handleNameKeyDown}
                maxLength={15}
                />
        </div>
    )
}

export default NameInput;