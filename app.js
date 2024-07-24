const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MySQLAdapter = require('@bot-whatsapp/database/mysql');
const mysql = require('mysql2/promise'); // Asegúrate de instalar mysql2
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = 'localhost';
const MYSQL_DB_USER = 'root';
const MYSQL_DB_PASSWORD = '12345';
const MYSQL_DB_NAME = 'chat';
const MYSQL_DB_PORT = '3306';

/**
 * Función para guardar mensajes en la base de datos
 */


/**
 * Función para obtener el saludo basado en la hora actual
 */
const getGreetingBasedOnTime = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 1 && currentHour < 12) {
        return '¡Buenos días!';
    } else if (currentHour >= 12 && currentHour < 18) {
        return '¡Buenas tardes!';
    } else {
        return '¡Buenas noches!';
    }
};

/**
 * Aquí declaramos los flujos hijos
 */
const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario']);

const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
    [
        '📄 Aquí encuentras la documentación, recuerda que puedes mejorarla',
        'https://bot-whatsapp.netlify.app/',
        '\n*2* Para siguiente paso.',
    ],
    async (ctx, { from }) => {
        try {
            await saveMessageToDB(ctx.body, '📄 Aquí encuentras la documentación, recuerda que puedes mejorarla', from, Date.now(), from);
        } catch (error) {
            console.error('Error en flowDocs:', error);
        }
    },
    null,
    [flowSecundario]
);

const flowTuto = addKeyword(['tutorial', 'tuto']).addAnswer(
    [
        '🙌 Aquí encuentras un ejemplo rápido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    async (ctx, { from }) => {
        try {
            await saveMessageToDB(ctx.body, '🙌 Aquí encuentras un ejemplo rápido', from, Date.now(), from);
        } catch (error) {
            console.error('Error en flowTuto:', error);
        }
    },
    null,
    [flowSecundario]
);

const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    async (ctx, { from }) => {
        try {
            await saveMessageToDB(ctx.body, '🚀 Puedes aportar tu granito de arena a este proyecto', from, Date.now(), from);
        } catch (error) {
            console.error('Error en flowGracias:', error);
        }
    },
    null,
    [flowSecundario]
);

const flowDiscord = addKeyword(['discord']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    async (ctx, { from }) => {
        try {
            await saveMessageToDB(ctx.body, '🤪 Únete al discord', from, Date.now(), from);
        } catch (error) {
            console.error('Error en flowDiscord:', error);
        }
    },
    null,
    [flowSecundario]
);

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer(
        async (ctx, { from }) => {
            try {
                const greeting = getGreetingBasedOnTime();
                await saveMessageToDB(ctx.body, greeting, from, Date.now(), from);
                return greeting;
            } catch (error) {
                console.error('Error en flowPrincipal:', error);
            }
        }
    )
    .addAnswer(
        [
            'te comparto los siguientes links de interés sobre el proyecto',
            '👉 *doc* para ver la documentación',
            '👉 *gracias* para ver la lista de videos',
            '👉 *discord* unirte al discord',
        ],
        async (ctx, { from }) => {
            try {
                await saveMessageToDB(ctx.body, 'te comparto los siguientes links de interés sobre el proyecto', from, Date.now(), from);
            } catch (error) {
                console.error('Error en flowPrincipal:', error);
            }
        },
        null,
        [flowDocs, flowGracias, flowTuto, flowDiscord]
    );

/**
 * Configuración del bot y el proveedor
 */
const main = async () => {
    try {
        const app = express();
        const adapterDB = new MySQLAdapter({
            host: MYSQL_DB_HOST,
            user: MYSQL_DB_USER,
            database: MYSQL_DB_NAME,
            password: MYSQL_DB_PASSWORD,
            port: MYSQL_DB_PORT,
        });

        const adapterFlow = createFlow([flowPrincipal]);

        const adapterProvider = createProvider(BaileysProvider, {
        
        });

        // Iniciar servidor Express
        const PORT = process.PORT;
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en puerto ${PORT}`);
        });

        // Iniciar el bot y otras configuraciones
        createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        });

        QRPortalWeb();
    } catch (error) {
        console.error('Error en la ejecución principal:', error);
    }
};

main().catch((error) => {
    console.error('Error en la ejecución principal:', error);
});
