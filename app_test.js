describe('House API', () => {
    const request = supertest(app);

    it('should upload house details', async () => {
        const response = await request
            .post('/houses')
            .send({
                owner: 'John Doe',
                area: '200 sq. ft',
                sale_price: 100000,
                negotiable: true
            });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should get house details by ID', async () => {
        const uploadResponse = await request
            .post('/houses')
            .send({
                owner: 'Jane Doe',
                area: '150 sq. ft',
                sale_price: 80000,
                negotiable: false
            });

        const response = await request.get(`/houses/${uploadResponse.body.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('owner', 'Jane Doe');
    });

    it('should list all houses', async () => {
        const response = await request.get('/houses');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should update house details by ID', async () => {
        const uploadResponse = await request
            .post('/houses')
            .send({
                owner: 'James Doe',
                area: '250 sq. ft',
                sale_price: 120000,
                negotiable: true
            });

        const response = await request
            .put(`/houses/${uploadResponse.body.id}`)
            .send({ status: 'Sold' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'House details updated successfully');
    });
});
