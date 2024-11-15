(async () => {
    try {
        const response = await fetch('http://localhost:3000/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Моя заметка',
                content: 'Заметка для КТ5'
            })
        });
        
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
})();
