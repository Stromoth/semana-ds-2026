const listsService = require('../services/lists.service');

function lerId(value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return null;
    }
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function lerDadosLista(body) {
    const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
    const descricao = typeof body?.descricao === 'string' ? body.descricao.trim() : '';

    if (nome.length < 2 || nome.length > 80) {
        return { erro: 'O nome da lista deve ter entre 2 e 80 caracteres.' };
    }
    if (descricao.length > 500) {
        return { erro: 'A descrição deve ter no máximo 500 caracteres.' };
    }
    if (typeof body?.publica !== 'boolean') {
        return { erro: 'Informe se a lista será pública ou privada.' };
    }

    return { nome, descricao, publica: body.publica };
}

async function listarPublicas(req, res) {
    try {
        const listas = await listsService.listarPublicas();
        return res.status(200).json(listas);
    } catch (error) {
        console.error('Erro ao consultar listas públicas:', error);
        return res.status(500).json({ erro: 'Erro ao consultar listas públicas.' });
    }
}

async function listarMinhas(req, res) {
    try {
        const listas = await listsService.listarMinhas(req.usuario.id);
        return res.status(200).json(listas);
    } catch (error) {
        console.error('Erro ao consultar listas do usuário:', error);
        return res.status(500).json({ erro: 'Erro ao consultar suas listas.' });
    }
}

async function buscar(req, res) {
    const listaId = lerId(req.params.id);
    if (!listaId) {
        return res.status(400).json({ erro: 'ID de lista inválido.' });
    }

    try {
        const usuarioId = Number.isSafeInteger(req.session?.userId)
            ? req.session.userId
            : null;
        const lista = await listsService.buscarPorId(listaId, usuarioId);
        if (!lista) {
            return res.status(404).json({ erro: 'Lista não encontrada.' });
        }
        return res.status(200).json(lista);
    } catch (error) {
        console.error('Erro ao consultar lista:', error);
        return res.status(500).json({ erro: 'Erro ao consultar lista.' });
    }
}

async function criar(req, res) {
    const dados = lerDadosLista(req.body);
    if (dados.erro) {
        return res.status(400).json({ erro: dados.erro });
    }

    try {
        const lista = await listsService.criar(
            req.usuario.id,
            dados.nome,
            dados.descricao,
            dados.publica
        );
        return res.status(201).json(lista);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ erro: 'Você já possui uma lista com esse nome.' });
        }
        console.error('Erro ao criar lista:', error);
        return res.status(500).json({ erro: 'Erro ao criar lista.' });
    }
}

async function atualizar(req, res) {
    const listaId = lerId(req.params.id);
    if (!listaId) {
        return res.status(400).json({ erro: 'ID de lista inválido.' });
    }
    const dados = lerDadosLista(req.body);
    if (dados.erro) {
        return res.status(400).json({ erro: dados.erro });
    }

    try {
        const lista = await listsService.atualizar(
            req.usuario.id,
            listaId,
            dados.nome,
            dados.descricao,
            dados.publica
        );
        if (!lista) {
            return res.status(404).json({ erro: 'Lista não encontrada.' });
        }
        return res.status(200).json(lista);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ erro: 'Você já possui uma lista com esse nome.' });
        }
        console.error('Erro ao atualizar lista:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar lista.' });
    }
}

async function remover(req, res) {
    const listaId = lerId(req.params.id);
    if (!listaId) {
        return res.status(400).json({ erro: 'ID de lista inválido.' });
    }
    try {
        const removida = await listsService.remover(req.usuario.id, listaId);
        if (!removida) {
            return res.status(404).json({ erro: 'Lista não encontrada.' });
        }
        return res.status(200).json({ mensagem: 'Lista removida.' });
    } catch (error) {
        console.error('Erro ao remover lista:', error);
        return res.status(500).json({ erro: 'Erro ao remover lista.' });
    }
}

async function adicionarJogo(req, res) {
    const listaId = lerId(req.params.id);
    const gamebrainId = req.body?.gamebrain_id;
    if (!listaId || !Number.isSafeInteger(gamebrainId) || gamebrainId <= 0) {
        return res.status(400).json({ erro: 'Lista ou jogo inválido.' });
    }

    try {
        const item = await listsService.adicionarJogo(
            req.usuario.id,
            listaId,
            gamebrainId
        );
        if (!item) {
            return res.status(400).json({
                erro: 'A lista não foi encontrada ou o jogo não está na sua biblioteca.'
            });
        }
        return res.status(201).json(item);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ erro: 'Este jogo já está na lista.' });
        }
        console.error('Erro ao adicionar jogo à lista:', error);
        return res.status(500).json({ erro: 'Erro ao adicionar jogo à lista.' });
    }
}

async function removerJogo(req, res) {
    const listaId = lerId(req.params.id);
    const gamebrainId = lerId(req.params.gamebrainId);
    if (!listaId || !gamebrainId) {
        return res.status(400).json({ erro: 'Lista ou jogo inválido.' });
    }

    try {
        const removido = await listsService.removerJogo(
            req.usuario.id,
            listaId,
            gamebrainId
        );
        if (!removido) {
            return res.status(404).json({ erro: 'Jogo não encontrado na lista.' });
        }
        return res.status(200).json({ mensagem: 'Jogo removido da lista.' });
    } catch (error) {
        console.error('Erro ao remover jogo da lista:', error);
        return res.status(500).json({ erro: 'Erro ao remover jogo da lista.' });
    }
}

module.exports = {
    listarPublicas,
    listarMinhas,
    buscar,
    criar,
    atualizar,
    remover,
    adicionarJogo,
    removerJogo
};
