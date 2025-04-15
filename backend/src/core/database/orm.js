const { Op } = require('sequelize');

class BaseQueryBuilder {
    constructor(model) {
        this.model = model;
        this.queryOptions = {
            where: {},
            order: [],
            limit: null,
            offset: null,
            attributes: null,
            include: [],
        };
    }

    select(columns) {
        this.queryOptions.attributes = columns;
        return this;
    }

    where(field, operator =  '=', value) {
        const sequelizeOp = this._mapOperator(operator);
        this.queryOptions.where[field] = { [sequelizeOp]: value };
        return this;
    }

    orWhere(field, operator =  '=', value) {
        if (!this.queryOptions.where[Op.or]) {
            this.queryOptions.where[Op.or] = [];
        }
        this.queryOptions.where[Op.or].push({ [field]: { [this._mapOperator(operator)]: value } });
        return this;
    }

    limit(value) {
        this.queryOptions.limit = value;
        return this;
    }

    offset(value) {
        this.queryOptions.offset = value;
        return this;
    }

    orderBy(field, direction = 'ASC') {
        this.queryOptions.order.push([field, direction.toUpperCase()]);
        return this;
    }

    with(relations) {
        this.queryOptions.include = Array.isArray(relations) ? relations : [relations];
        return this;
    }

    async get() {
        return await this.model.findAll(this.queryOptions);
    }

    async first() {
        this.queryOptions.limit = 1;
        const result = await this.model.findAll(this.queryOptions);
        return result[0] || null;
    }

    async insert(data) {
        return await this.model.create(data);
    }

    async update(values) {
        return await this.model.update(values, { where: this.queryOptions.where });
    }

    async delete() {
        return await this.model.destroy({ where: this.queryOptions.where });
    }

    _mapOperator(operator) {
        switch (operator) {
            case '=': return Op.eq;
            case '>': return Op.gt;
            case '<': return Op.lt;
            case '>=': return Op.gte;
            case '<=': return Op.lte;
            case '!=':
            case '<>': return Op.ne;
            case 'like': return Op.like;
            case 'in': return Op.in;
            default: throw new Error(`Unsupported operator: ${operator}`);
        }
    }
}

module.exports = BaseQueryBuilder;
