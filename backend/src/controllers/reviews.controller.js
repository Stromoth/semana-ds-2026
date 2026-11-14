const reviewsService = require('../services/reviews.service');

function lerId(valor) {
    if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
        return null;
    }

    const id = Number(valor);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function lerAvaliacao(body) {
    const nota = body?.nota;
    const texto = typeof body?.texto === 'string' ? body.texto.trim() : '';

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
        return { erro: 'A nota deve ser um número inteiro entre 1 e 5.' };
    }

    if (!texto || texto.length > 2000) {
        return { erro: 'A avaliação deve conter entre 1 e 2000 caracteres.' };
    }

    return { nota, texto };
}

async function listar(req, res) {
    try {
        const ordenacao = req.query.sort === undefined ? 'recent' : req.query.sort;
        if (!['recent', 'popular'].includes(ordenacao)) {
            return res.status(400).json({
                erro: 'Ordenação inválida. Use recent ou popular.'
            });
        }
        const usuarioId = Number.isSafeInteger(req.session?.userId)
            ? req.session.userId
            : null;
        const avaliacoes = await reviewsService.listarAvaliacoes(ordenacao, usuarioId);
        return res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro ao consultar avaliações:', error);
        return res.status(500).json({ erro: 'Erro ao consultar avaliações.' });
    }
}

async function definirCurtida(req, res, curtida) {
    const avaliacaoId = lerId(req.params.id);
    if (!avaliacaoId) {
        return res.status(400).json({ erro: 'ID de avaliação inválido.' });
    }

    try {
        const resultado = await reviewsService.definirCurtida(
            req.usuario.id,
            avaliacaoId,
            curtida
        );
        if (!resultado) {
            return res.status(404).json({ erro: 'Avaliação não encontrada.' });
        }
        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Erro ao atualizar curtida:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar curtida.' });
    }
}

function curtir(req, res) {
    return definirCurtida(req, res, true);
}

function descurtir(req, res) {
    return definirCurtida(req, res, false);
}

async function listarMinhas(req, res) {
    try {
        const avaliacoes = await reviewsService.listarAvaliacoesDoUsuario(req.usuario.id);
        return res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro ao consultar avaliações do usuário:', error);
        return res.status(500).json({ erro: 'Erro ao consultar suas avaliações.' });
    }
}

async function criar(req, res) {
    const gamebrainId = req.body?.gamebrain_id;
    if (!Number.isSafeInteger(gamebrainId) || gamebrainId <= 0) {
        return res.status(400).json({ erro: 'Informe um ID GameBrain válido.' });
    }

    const avaliacao = lerAvaliacao(req.body);
    if (avaliacao.erro) {
        return res.status(400).json({ erro: avaliacao.erro });
    }

    try {
        const criada = await reviewsService.criarAvaliacao(
            req.usuario.id,
            gamebrainId,
            avaliacao.nota,
            avaliacao.texto
        );

        if (!criada) {
            return res.status(400).json({
                erro: 'Adicione o jogo à sua biblioteca antes de avaliá-lo.'
            });
        }

        return res.status(201).json(criada);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                erro: 'Você já avaliou este jogo. Edite sua avaliação existente.'
            });
        }

        console.error('Erro ao criar avaliação:', error);
        return res.status(500).json({ erro: 'Erro ao criar avaliação.' });
    }
}

async function atualizar(req, res) {
    const avaliacaoId = lerId(req.params.id);
    if (!avaliacaoId) {
        return res.status(400).json({ erro: 'ID de avaliação inválido.' });
    }

    const avaliacao = lerAvaliacao(req.body);
    if (avaliacao.erro) {
        return res.status(400).json({ erro: avaliacao.erro });
    }

    try {
        const atualizada = await reviewsService.atualizarAvaliacao(
            req.usuario.id,
            avaliacaoId,
            avaliacao.nota,
            avaliacao.texto
        );

        if (!atualizada) {
            return res.status(404).json({ erro: 'Avaliação não encontrada.' });
        }

        return res.status(200).json(atualizada);
    } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar avaliação.' });
    }
}

async function remover(req, res) {
    const avaliacaoId = lerId(req.params.id);
    if (!avaliacaoId) {
        return res.status(400).json({ erro: 'ID de avaliação inválido.' });
    }

    try {
        const removida = await reviewsService.removerAvaliacao(
            req.usuario.id,
            avaliacaoId
        );

        if (!removida) {
            return res.status(404).json({ erro: 'Avaliação não encontrada.' });
        }

        return res.status(200).json({ mensagem: 'Avaliação removida.' });
    } catch (error) {
        console.error('Erro ao remover avaliação:', error);
        return res.status(500).json({ erro: 'Erro ao remover avaliação.' });
    }
}

module.exports = {
    listar,
    listarMinhas,
    criar,
    atualizar,
    remover,
    curtir,
    descurtir
};
