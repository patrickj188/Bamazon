let mysql = require('mysql');
let inquirer = require('inquirer');
let whatsTheMagicWord = require('./keys.js');
const chalk = require('chalk')

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: whatsTheMagicWord,
    databse: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + "\n")
    managerView();

})


let managerView = () => {
    inquirer.prompt([{
        type: "list",
        name: "manager",
        message: "Welcome manager, what do you need to do?",
        choices: ["View Inventory", "View out of stock items", "Add Inventory", "Add new Inventory"]
    }]).then(function (answer) {
        switch (answer.manager) {
            case "View Inventory":
                inventory();
                break;

            case "View out of stock items":
                lowInventory();
                break;

            case "Add Inventory":
                addInventory();
                break;

            case "Add new Inventory":
                newInventory();
                break;
        }
    });


}

let inventory = () => {
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {
            console.log(chalk.cyan(`Item# -- ${res[i].item_id} \n`,
                `Product -- ${res[i].product_name}  \n`,
                `Department -- ${res[i].department_name} \n`,
                `Price -- $${res[i].price} \n`,
                `Stock -- ${res[i].stock_quantity} \n`,
                `------------------------------------------------ \x1b[1m`
            ))
        }
        managerView();
    });
}

let newInventory = () => {
    connection.query('SELECT DISTINCT department_name FROM bamazon.products', function (err, res) {
        if (err) throw err;

        const departments = res.map(x => x.department_name)
        inquirer.prompt([{
            type: 'input',
            name: 'product',
            message: 'Product Name: '
        },
        {
            type: 'list',
            name: 'departments',
            message: 'Department: ',
            choices: departments
        },
        {
            type: 'input',
            name: 'price',
            message: "Item Price: "
        },
        {
            type: "input",
            name: 'quantity',
            message: 'Item Quantity: '

        }

        ]).then(function (answer) {
            connection.query('INSERT INTO bamazon.products SET ?', {
                product_name: answer.product,
                department_name: answer.departments,
                price: answer.price,
                stock_quantity: answer.quantity
            },
                function (err, res) {
                    if (err) throw err;
                    console.log('Product was added to inventory')
                    managerView();
                })
        })
            .catch(function (err) {
                console.log('Catch an error: ', err);
            })
    })
}


let addInventory = () => {
    let items = [];
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        if (err) return console.log(err)
        const items = res.map(x => x.product_name);
        inquirer.prompt([{
            type: "list",
            name: 'product',
            message: 'What item would you like to add to?',
            choices: items
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many new items would you like to add?'
        }
        ]).then(function (answer) {
            connection.query(`UPDATE bamazon.products SET stock_quantity = ${answer.quantity} WHERE product_name = '${answer.product}'`,
                function (err, res) {
                    if (err) throw err;
                    console.log('The quantity was updated.');
                    managerView();
                });

        })
    })
}


let lowInventory = () => {
    connection.query('SELECT * FROM bamazon.products', function (err, res) {
        if (err) throw err;
        res.forEach(item => {
            if (item.stock_quantity <= 3) {
                console.log(chalk.cyan(`Item# -- ${item.item_id} \n`,
                    `Product -- ${item.product_name}  \n`,
                    `Department -- ${item.department_name} \n`,
                    `Price -- $${item.price} \n`,
                    `Stock -- ${item.stock_quantity} \n`,
                    `------------------------------------------------ \x1b[1m`
                ))
            }
        })
        managerView();
    })
}






