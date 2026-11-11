const authService = require('../services/auth.services');

function regenerarSessao(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

async function register(req, res) {
    try {
        const { nome, email, senha } = req.body || {};

        if (
            typeof nome !== 'string' ||
            typeof email !== 'string' ||
            typeof senha !== 'string'
        ) {
            return res.status(400).json({
                erro: 'Preencha todos os campos corretamente.'
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (nomeLimpo.length < 2 || nomeLimpo.length > 100) {
            return res.status(400).json({
                erro: 'O nome deve possuir entre 2 e 100 caracteres.'
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
            return res.status(400).json({
                erro: 'Informe um e-mail válido.'
            });
        }

        if (
            senha.length < 8 ||
            Buffer.byteLength(senha, 'utf8') > 72
        ) {
            return res.status(400).json({
                erro: 'A senha deve possuir pelo menos 8 caracteres e no máximo 72 bytes.'
            });
        }

        const usuario = await authService.register(
            nomeLimpo,
            emailLimpo,
            senha
        );

        await regenerarSessao(req);

        req.session.userId = usuario.id;

        return res.status(201).json({
            mensagem: 'Cadastro realizado com sucesso!',
            usuario
        });
    
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                erro: 'Este e-mail já está cadastrado.'
            });
        }

        console.error('Error no cadastro:', error);

        return res.status(500).json({
            erro: 'Erro interno ao realizar cadastro.'
        });
    }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body || {};
        
        if (
            typeof email !== "string" ||
            typeof senha !== "string" ||
            !email.trim() ||
            !senha
        ) {
            return res.status(400).json({
                erro: 'Informe e-mail e senha.'
            });
        }

        const usuario = await authService.login(
            email.trim().toLowerCase(),
            senha
        );

        if (!usuario) {
            return res.status(401).json({
                erro: 'E-mail ou senha incorretos.'
            });
        }

        await regenerarSessao(req);

        req.session.userId = usuario.id;

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuario
        });

    } catch (error) {
        console.error('Erro no login:', error);

        return res.status(500).json({
            erro: 'Erro interno ao realizar login.'
        });
    } 
}

function logout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                erro: 'Não foi possível encerrar a sessão.'
            });
        }

        res.clearCookie('gamebox.sid', {
            path: '/'
        });

        return res.status(200).json({
            mensagem: 'Logout realizado com sucesso!'
        });
    });
}

function me(req, res) {
    return res.status(200).json({
        usuario: req.usuario
    });
}

module.exports = {
    register,
    login, 
    logout,
    me
};