const useGetVAT = async (vatCode) => {

    const url = "https://back-centrale-fillers.herokuapp.com/v1/Vat";

    const response = await postData(url, { vat:vatCode })
    if(response){
        return response.isValid;
    }
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', 
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}  

export default useGetVAT;