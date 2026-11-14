const usersService = require('../services/users.service');

function lerId(value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return null;
    }
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function listar(req, res) {
    const termo = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (termo.length > 100) {
        return res.status(400).json({ erro: 'A busca deve ter no máximo 100 caracteres.' });
    }

    try {
        const usuarioId = Number.isSafeInteger(req.session?.userId)
            ? req.session.userId
            : null;
        const usuarios = await usersService.buscarUsuarios(termo, usuarioId);
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao consultar jogadores:', error);
        return res.status(500).json({ erro: 'Erro ao consultar jogadores.' });
    }
}

async function listarSeguindo(req, res) {
    try {
        const usuarios = await usersService.listarSeguindo(req.usuario.id);
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao consultar jogadores seguidos:', error);
        return res.status(500).json({ erro: 'Erro ao consultar sua rede.' });
    }
}

async function buscarPerfil(req, res) {
    const perfilId = lerId(req.params.id);
    if (!perfilId) {
        return res.status(400).json({ erro: 'ID de jogador inválido.' });
    }

    try {
        const visitanteId = Number.isSafeInteger(req.session?.userId)
            ? req.session.userId
            : null;
        const perfil = await usersService.buscarPerfil(perfilId, visitanteId);
        if (!perfil) {
            return res.status(404).json({ erro: 'Jogador não encontrado.' });
        }
        return res.status(200).json(perfil);
    } catch (error) {
        console.error('Erro ao consultar perfil:', error);
        return res.status(500).json({ erro: 'Erro ao consultar perfil.' });
    }
}

async function alterarRelacao(req, res, seguindo) {
    const seguidoId = lerId(req.params.id);
    if (!seguidoId) {
        return res.status(400).json({ erro: 'ID de jogador inválido.' });
    }
    if (seguidoId === req.usuario.id) {
        return res.status(400).json({ erro: 'Você não pode seguir a si mesmo.' });
    }

    try {
        if (seguindo) {
            const criada = await usersService.seguir(req.usuario.id, seguidoId);
            if (!criada) {
                const perfil = await usersService.buscarPerfil(seguidoId, req.usuario.id);
                if (!perfil) {
                    return res.status(404).json({ erro: 'Jogador não encontrado.' });
                }
            }
            return res.status(200).json({ seguindo: true });
        }

        await usersService.deixarDeSeguir(req.usuario.id, seguidoId);
        return res.status(200).json({ seguindo: false });
    } catch (error) {
        console.error('Erro ao atualizar relação entre jogadores:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar relação entre jogadores.' });
    }
}

function seguir(req, res) {
    return alterarRelacao(req, res, true);
}

function deixarDeSeguir(req, res) {
    return alterarRelacao(req, res, false);
}

module.exports = {
    listar,
    listarSeguindo,
    buscarPerfil,
    seguir,
    deixarDeSeguir
};
