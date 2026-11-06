const libraryService = require('../services/library.service');

const STATUS_VALIDOS = [
    'quero_jogar',
    'jogando',
    'pausado',
    'concluido',
    'abandonado',
];

async function adicionar(req, res) {
    const rawgId = Number(req.body.rawg_id);

    if (!Number.isSafeInteger(rawgId) || rawgId <= 0) {
        return res.status(400).json({
            erro: 'Informe um Id válido do jogo.'
        });
    }

    try {
        const jogo = await libraryService.adicionarJogo(
            req.usuario.id,
            rawgId
        );

        return res.status(201).json(jogo);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                erro: 'Este jogo já está na sua biblioteca.'
            });
        }

        console.error(error);

        return res.status(error.statusCode || 500).json({
            erro: error.statusCode
                ? error.message
                : 'Erro ao adicionar jogo.'
        });
    }
}

async function listar(req, res) {
    try {
        const jogos = await libraryService.listarBiblioteca(
            req.usuario.id
        );

        return res.status(200).json(jogos);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao consultar biblioteca.'
        });
    }
}

async function atualizarStatus(req, res) {
    const bibliotecaId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isSafeInteger(bibliotecaId) || bibliotecaId <= 0) {
        return res.status(400).json({
            erro: 'ID da biblioteca inválido.'
        });
    }

    if (!STATUS_VALIDOS.includes(status)) {
        return res.status(400).json({
            erro: 'Status inválido.'
        });
    }

    try {
        const jogo = await libraryService.atualizarStatus(
            req.usuario.id,
            bibliotecaId,
            status
        );

        if (!jogo) {
            return res.status(404).json({
                erro: 'Jogo não encontrado na biblioteca.'
            });
        }

        return res.status(200).json;
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao atualizar status.'
        });
    }
}

async function remover(req, res) {
    const bibliotecaId = Number(req.params.id);

    if (!Number.isSafeInteger(bibliotecaId) || bibliotecaId <= 0) {
        return res.status(400).json({
            erro: 'ID da biblioteca invalido.'
        });
    }

    try {
        const removido = await libraryService.removerJogo(
            req.usuario.id,
            bibliotecaId
        );

        if (!removido) {
            return res.status(404).json({
                erro: 'Jogo não encontrado na biblioteca.'
            });
        } 

        return res.status(200).json({
            mensagem: 'Jogo removido da biblioteca.'
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: 'Erro ao remover jogo.'
        });
    }
}

module.exports = {
    adicionar,
    listar,
    atualizarStatus,
    remover
};