<template>
    <v-container>

        <v-row justify="center">

            <v-col cols="12" md="4">
                <v-card class="d-flex flex-column">

                    <v-card-title>Happiness overtime</v-card-title>
                    <line-chart v-if="happinessLoaded" :chart-data="happinessData" :options="happinessOptions"></line-chart>
                    <v-progress-circular v-else indeterminate :size="100" class="align-self-center"></v-progress-circular>


                </v-card>
            </v-col>

        </v-row>

    </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import LineChart from '../components/LineChart.vue'

export default Vue.extend({
    components: {
        LineChart
    },
    data: () => {
        return {
            happinessData: {
                labels: [],
                datasets: [{
                    label: "",
                    data: null,
                    borderColor: '#BFDBF7',
                    backgroundColor: '#EDF5FD'
                }]
            },
            happinessOptions: {
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 5
                        }
                    }]
                }
            },
            /*happinessData: {
                labels: ["2020-10-09", "2020-10-10"],
                datasets: [
                    {
                        label: "Happiness",
                        data: [3, 4]
                    }
                ]
            },*/
            startDateHappiness: "2020-10-01",
            endDateHappiness: "2020-10-30",
            happinessLoadFailed: false,
            happinessLoaded: false
        }
    },

    mounted: function () {
        this.happinessLoadFailed = false;
        this.happinessLoaded = false;
        this.$http.get(`${process.env.VUE_APP_API_URL}/api/days/range/${this.startDateHappiness}/${this.endDateHappiness}`).then((response: any) => {
            const formattedData = response.data.map((o: any) => o.moodscore);

            const labels = response.data.map((o: any) => o.date);

            this.happinessData.datasets[0].label = "Happiness";
            this.happinessData.datasets[0].data = formattedData;
            this.happinessData.labels = labels;
            this.happinessLoaded = true;

        }, (err: any) => this.happinessLoadFailed = true)
    }
    
})
</script>