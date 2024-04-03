const express = require('express');
const Joi = require('joi');
const app = express();

//utilizar a serialização e desserialização em json built-in do express
app.use(express.json());

//Database pra teste local
const compras = [
    /*{nome: 'Abaco', quantidade: 1, preco: 10.20, tipoProduto: 'brinquedo', idPedido: 1},*/
];

app.get('/', (req, res) =>{
    res.send("Bem vindo à API de compras");
});

//enviar todas as compras da database
app.get('/api/compras', (req,res) =>{
    res.send(compras);
});
//enviar uma compra cadastrada na database
app.get('/api/compras/:id', (req,res) =>{
    //encontrar compra cujo id foi passado na url
    const compra = compras.find(c => c.idPedido === parseInt(req.params.id));
    if(compra === undefined){
        res.status(404).send('ERRO! Não encontramos a informação que você procurava');
    }
    res.send(compra);
});

//criar compra nova na database
app.post('/api/compras', (req,res) =>{
    //chamar a função para checar se a compra repassada é válida
    const { error } = validarCompra(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }
    //se for válida, criar objeto para adicionar à database
    const compra = {
        nome: req.body.nome,
        quantidade: req.body.quantidade,
        preco: req.body.preco,
        tipoProduto: req.body.tipoProduto,
        idPedido: compras.length+1
    };

    compras.push(compra);
    res.status(201).send(compra);
});

//atualizar compra já existente na database
app.put('/api/compras/:id', (req,res) =>{
    //checar primeiro se a compra cujo id foi passado na url existe e depois se a compra passado é válida
    const compra = compras.find(c => c.idPedido === parseInt(req.params.id));
    if(compra === undefined){
        res.status(404).send('ERRO! Não encontramos a informação que você procurava');
    }

    const { error } = validarCompra(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }

    //atualizar as informações da compra
    compra.nome = req.body.nome;
    compra.preco = req.body.preco;
    compra.quantidade = req.body.quantidade;
    compra.tipoProduto = req.body.tipoProduto;
    res.send(compra);
});

//deletar compra da database
app.delete('/api/compras/:id', (req,res) =>{
    //checar se a compra de id repassado na url existe
    const compra = compras.find(c => c.idPedido === parseInt(req.params.id));
    if(compra === undefined){
        res.status(404).send('ERRO! Não encontramos a informação que você procurava');
    }
    
    //pegar o id da compra que deve ser deletada e deletar
    const index = compras.indexOf(compra);
    compras.splice(index,1);

    //atualizar o id das compras após o DELETE
    compras.forEach( (c) =>{
        if (c.idPedido > req.params.id) c.idPedido-=1;
    })

    res.send(compra);
});

//função que confere se o json passado para ser adicionado às compras é valido
function validarCompra(compra){
    //modelo de compra que utiliza Joi para definir quais valores são aceitaveis para cada key da compra
    const modelo = Joi.object().keys({
        nome: Joi.string().min(3).required(),
        quantidade: Joi.number().min(1).required(),
        preco: Joi.number().precision(2).min(0.01).required(),
        tipoProduto: Joi.string().valid('brinquedo', 'hardware', 'livro', 'roupa').required()
    });
    //Usa a api do joi para validar a compra repassada baseado no modelo
    return modelo.validate(compra);
}

//Definir onde o app vai ser criado e então criar
const port = process.env.PORT || 8080;  
app.listen(port, () => console.log(`ativo no port ${port}...`));